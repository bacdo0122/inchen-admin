import {
  Injectable,
  InternalServerErrorException,
  Logger,
  type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type _Object as R2Object,
} from '@aws-sdk/client-s3';
import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { createR2Client } from '../common/r2.util';

const execFileAsync = promisify(execFile);

/** Múi giờ nghiệp vụ — cron và tên file backup đều theo giờ Việt Nam. */
const TZ = 'Asia/Ho_Chi_Minh';

/** pg_dump chạy tối đa 10 phút; quá thì coi như treo và bỏ. */
const DUMP_TIMEOUT_MS = 10 * 60_000;

/**
 * Số bản backup mới nhất luôn được giữ lại, bất kể tuổi. Nếu app chết 8 ngày rồi
 * sống lại, lần prune đầu tiên KHÔNG được phép xóa sạch mọi backup cũ.
 */
const MIN_KEEP = 3;

/**
 * Chỉ prune object khớp đúng pattern tên do chính service này sinh ra.
 * Hậu tố random là optional để vẫn dọn được những file tạo trước khi thêm hậu tố.
 */
const BACKUP_KEY_RE = /\/inchem-\d{8}-\d{6}(-[0-9a-f]+)?\.dump$/;

/** DeleteObjects của S3/R2 nhận tối đa 1000 key mỗi request. */
const DELETE_BATCH = 1000;

export interface BackupResult {
  key: string;
  size: number;
  deleted: string[];
}

/** Thông tin kết nối tách từ DATABASE_URL, dạng biến môi trường PG* cho pg_dump. */
export type PgConnection = Record<string, string>;

/**
 * Query param của DATABASE_URL → biến môi trường libpq tương ứng.
 *
 * Chỉ forward những param libpq thật hiểu. Param riêng của Prisma
 * (schema, connection_limit, pool_timeout, pgbouncer, ...) bị bỏ — nếu truyền
 * nguyên URL cho pg_dump thì libpq reject ngay: `invalid URI query parameter: "schema"`.
 */
const LIBPQ_ENV_BY_PARAM: Record<string, string> = {
  sslmode: 'PGSSLMODE',
  sslrootcert: 'PGSSLROOTCERT',
  sslcert: 'PGSSLCERT',
  sslkey: 'PGSSLKEY',
  connect_timeout: 'PGCONNECT_TIMEOUT',
  application_name: 'PGAPPNAME',
  options: 'PGOPTIONS',
};

/** Giá trị sslmode libpq chấp nhận; khác đi là nó abort với "invalid sslmode value". */
const SSLMODES = ['disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full'];

/**
 * Tách DATABASE_URL thành các biến môi trường PG* cho pg_dump.
 *
 * Không truyền thẳng DATABASE_URL làm tham số của pg_dump vì hai lý do:
 * 1. URL của Prisma chứa param libpq không hiểu (`?schema=public`) → bị reject.
 * 2. Tham số dòng lệnh lộ mật khẩu trong `ps`.
 *
 * `onWarn` để caller log lại — hàm này giữ thuần để test được.
 */
export function parseDatabaseUrl(
  databaseUrl: string,
  onWarn: (msg: string) => void = () => undefined,
): PgConnection {
  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL không phải URL hợp lệ.');
  }

  if (!/^postgres(ql)?:$/.test(url.protocol)) {
    throw new Error(`DATABASE_URL phải là postgresql://, đang là "${url.protocol}"`);
  }

  const database = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!database) throw new Error('DATABASE_URL thiếu tên database.');

  const env: PgConnection = {
    PGHOST: url.hostname,
    PGPORT: url.port || '5432',
    // username/password trong URL là dạng percent-encoded — phải decode.
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGDATABASE: database,
  };

  for (const [param, envName] of Object.entries(LIBPQ_ENV_BY_PARAM)) {
    const value = url.searchParams.get(param);
    if (!value) continue;

    // Prisma dễ tính với sslmode hơn libpq (vd "req" thay vì "require"). Truyền giá trị
    // sai vào pg_dump là chết ngay, nên bỏ qua và cảnh báo — libpq sẽ tự dùng mặc định
    // "prefer" (vẫn thương lượng TLS trước).
    if (param === 'sslmode' && !SSLMODES.includes(value)) {
      onWarn(
        `DATABASE_URL có sslmode="${value}" không phải giá trị libpq hợp lệ ` +
          `(${SSLMODES.join(', ')}) — pg_dump sẽ dùng mặc định "prefer". ` +
          `Nếu muốn bắt buộc TLS, sửa thành sslmode=require.`,
      );
      continue;
    }

    env[envName] = value;
  }

  return env;
}

/**
 * Chọn key cần xóa: cũ hơn `cutoff`, nhưng luôn chừa lại `minKeep` bản mới nhất.
 * Object không khớp BACKUP_KEY_RE bị bỏ qua hoàn toàn (không bao giờ xóa nhầm
 * ảnh hay file khác nếu backup dùng chung bucket).
 */
export function selectKeysToDelete(
  objects: R2Object[],
  cutoff: Date,
  minKeep = MIN_KEEP,
): string[] {
  const backups = objects
    .filter((o): o is R2Object & { Key: string } => !!o.Key && BACKUP_KEY_RE.test(o.Key))
    // Mới nhất trước; thiếu LastModified thì coi như rất cũ.
    .sort((a, b) => (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0));

  return backups
    .slice(minKeep)
    .filter((o) => (o.LastModified?.getTime() ?? 0) < cutoff.getTime())
    .map((o) => o.Key);
}

/**
 * Tên file backup: `inchem-YYYYMMDD-HHmmss-<random>.dump` (stamp theo giờ VN).
 *
 * Hậu tố random 16 byte là vì backup nằm chung bucket với ảnh, mà bucket đó đọc
 * được công khai qua R2_PUBLIC_URL. Không có hậu tố thì key đoán được (cron chạy
 * đúng 1h sáng hằng ngày) và ai cũng tải được cả DB.
 */
export function backupFilename(now: Date): string {
  // en-CA cho định dạng ngày YYYY-MM-DD, en-GB cho giờ 24h — ghép lại rồi bỏ dấu.
  const date = now.toLocaleDateString('en-CA', { timeZone: TZ });
  const time = now.toLocaleTimeString('en-GB', { timeZone: TZ, hour12: false });
  const stamp = `${date.replace(/-/g, '')}-${time.replace(/:/g, '')}`;
  return `inchem-${stamp}-${randomBytes(16).toString('hex')}.dump`;
}

/**
 * Backup định kỳ toàn bộ Postgres lên Cloudflare R2.
 *
 * Chạy 1h sáng mỗi ngày (giờ VN): pg_dump định dạng custom (đã nén zlib sẵn) ra
 * file tạm → upload lên R2 → xóa bản cũ hơn BACKUP_RETENTION_DAYS.
 * Restore: `pg_restore -d <db> --clean --if-exists <file>.dump`.
 *
 * Dùng CHUNG bucket với upload ảnh (R2_BUCKET), khác prefix. Bucket đó public nên
 * tên file có hậu tố random — xem backupFilename().
 *
 * Cấu hình (.env):
 * - BACKUP_ENABLED         : phải = "true" mới chạy (mặc định tắt, để dev local không đẩy lên R2)
 * - BACKUP_CRON            : cron expression, mặc định "0 1 * * *"
 * - BACKUP_RETENTION_DAYS  : số ngày giữ lại, mặc định 7
 * - R2_BACKUP_FOLDER       : prefix trong bucket, mặc định "backup" (phải khác R2_FOLDER)
 * - cùng bộ R2_BUCKET / R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY với upload ảnh.
 */
@Injectable()
export class BackupService implements OnModuleInit {
  private readonly logger = new Logger(BackupService.name);
  private readonly client: S3Client | null;
  private readonly bucket?: string;
  private readonly folder: string;
  private readonly retentionDays: number;
  private readonly enabled: boolean;
  private readonly cron: string;
  /** Chống chạy chồng nếu lần trước còn treo (dump DB lớn / mạng chậm). */
  private running = false;

  constructor(
    private readonly config: ConfigService,
    private readonly scheduler: SchedulerRegistry,
  ) {
    // Dùng chung bucket với upload ảnh, chỉ khác prefix.
    this.bucket = config.get<string>('R2_BUCKET') || undefined;
    // Dùng "||" chứ không "??": biến đặt rỗng cũng phải về default, không thì key
    // thành "/inchem-....dump" (prefix rỗng) và prune list sai chỗ.
    const trim = (v?: string) => (v ?? '').replace(/^\/+|\/+$/g, '');
    this.folder = trim(config.get<string>('R2_BACKUP_FOLDER')) || 'backup';

    // Trùng prefix với ảnh thì prune có thể quét vào vùng ảnh (regex tên vẫn chặn
    // việc xóa, nhưng cấu hình như vậy là sai ý) → chặn ngay từ đầu.
    const imageFolder = trim(config.get<string>('R2_FOLDER')) || 'inchem';
    if (this.folder === imageFolder) {
      throw new Error(
        `R2_BACKUP_FOLDER ("${this.folder}") không được trùng R2_FOLDER — backup và ảnh phải khác prefix.`,
      );
    }
    // Giá trị rác (typo) sẽ thành NaN và âm thầm vô hiệu hóa việc xóa bản cũ →
    // quay về 7 và cảnh báo, đừng để retention tắt lặng lẽ.
    const days = Number(config.get<string>('BACKUP_RETENTION_DAYS') ?? 7);
    if (!Number.isFinite(days) || days < 1) {
      this.logger.warn(
        `BACKUP_RETENTION_DAYS không hợp lệ ("${config.get<string>('BACKUP_RETENTION_DAYS')}") — dùng mặc định 7 ngày.`,
      );
    }
    this.retentionDays = Number.isFinite(days) && days >= 1 ? days : 7;
    this.enabled = config.get<string>('BACKUP_ENABLED') === 'true';
    this.cron = config.get<string>('BACKUP_CRON') || '0 1 * * *';
    this.client = this.bucket ? createR2Client(config) : null;
  }

  /**
   * Đăng ký cron bằng SchedulerRegistry thay vì decorator @Cron: decorator được
   * đánh giá lúc import class, tức TRƯỚC khi ConfigModule nạp file .env vào
   * process.env — đọc BACKUP_CRON ở đó sẽ luôn ra giá trị mặc định.
   */
  onModuleInit(): void {
    if (!this.enabled) {
      this.logger.log('BACKUP_ENABLED chưa bật — cronjob backup DB sẽ không chạy.');
      return;
    }
    if (!this.client) {
      this.logger.warn('Cloudflare R2 chưa cấu hình — cronjob backup DB sẽ không chạy.');
      return;
    }

    const job = new CronJob(
      this.cron,
      () => void this.runQuietly(),
      null,
      false,
      // timeZone tường minh để không phụ thuộc TZ của container/máy dev.
      TZ,
    );
    this.scheduler.addCronJob('db-backup', job);
    job.start();

    this.logger.log(
      `Cron backup DB "${this.cron}" (${TZ}) → ${this.bucket}/${this.folder}, giữ ${this.retentionDays} ngày.`,
    );
  }

  /** Bọc run() cho cron: không ai catch giúp nên phải tự nuốt lỗi, chỉ log. */
  private async runQuietly(): Promise<void> {
    try {
      await this.run();
    } catch (err) {
      this.logger.error(`Backup DB định kỳ thất bại: ${(err as Error).message}`, err as Error);
    }
  }

  /** Chạy 1 lượt backup. Ném lỗi ra ngoài để controller trả về cho admin. */
  async run(): Promise<BackupResult> {
    if (!this.client || !this.bucket) {
      throw new InternalServerErrorException('Cloudflare R2 chưa được cấu hình trên server.');
    }
    if (this.running) {
      throw new InternalServerErrorException('Một lượt backup khác đang chạy.');
    }

    // Đặt cờ rồi mới vào try/finally: mọi đường ra sau đây đều nhả cờ, không để
    // một lỗi bất ngờ khóa cứng backup của những ngày sau.
    this.running = true;
    let file: string | undefined;
    try {
      const name = backupFilename(new Date());
      file = join(tmpdir(), name);
      const key = `${this.folder}/${name}`;

      await this.dump(file);
      const { size } = await stat(file);
      await this.upload(key, file, size);
      this.logger.log(`Đã upload backup ${key} (${(size / 1024 / 1024).toFixed(2)} MB)`);

      const deleted = await this.prune();
      if (deleted.length) {
        this.logger.log(`Đã xóa ${deleted.length} backup quá ${this.retentionDays} ngày.`);
      }
      return { key, size, deleted };
    } finally {
      this.running = false;
      // File tạm luôn phải dọn, kể cả khi upload lỗi.
      if (file) await unlink(file).catch(() => undefined);
    }
  }

  /** pg_dump ra file tạm, định dạng custom (-Fc) nén mức 9 — không cần gzip thêm. */
  private async dump(file: string): Promise<void> {
    const databaseUrl = this.config.get<string>('DATABASE_URL');
    if (!databaseUrl) throw new InternalServerErrorException('DATABASE_URL chưa được cấu hình.');

    const conn = parseDatabaseUrl(databaseUrl, (msg) => this.logger.warn(msg));
    try {
      // execFile (không qua shell) → không có chỗ cho injection.
      // Thông tin kết nối đi qua env của child process, không qua argv.
      await execFileAsync(
        'pg_dump',
        ['--format=custom', '--compress=9', '--no-owner', '--no-privileges', '--file', file],
        { env: { ...process.env, ...conn }, timeout: DUMP_TIMEOUT_MS },
      );
    } catch (err) {
      const { stderr, message } = err as { stderr?: string; message: string };
      throw new InternalServerErrorException(`pg_dump thất bại: ${stderr?.trim() || message}`);
    }
  }

  /**
   * Upload file dump lên R2. Body là stream nên phải tự truyền ContentLength —
   * SDK không tự suy ra được và R2 sẽ từ chối request thiếu độ dài.
   */
  private async upload(key: string, file: string, size: number): Promise<void> {
    await this.client!.send(
      new PutObjectCommand({
        Bucket: this.bucket!,
        Key: key,
        Body: createReadStream(file),
        ContentLength: size,
        ContentType: 'application/octet-stream',
      }),
    );
  }

  /** Xóa các backup cũ hơn retentionDays. Trả về danh sách key đã xóa. */
  private async prune(): Promise<string[]> {
    const objects: R2Object[] = [];
    let token: string | undefined;
    do {
      const page = await this.client!.send(
        new ListObjectsV2Command({
          Bucket: this.bucket!,
          Prefix: `${this.folder}/`,
          ContinuationToken: token,
        }),
      );
      objects.push(...(page.Contents ?? []));
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);

    const cutoff = new Date(Date.now() - this.retentionDays * 24 * 60 * 60 * 1000);
    const keys = selectKeysToDelete(objects, cutoff);

    for (let i = 0; i < keys.length; i += DELETE_BATCH) {
      const batch = keys.slice(i, i + DELETE_BATCH);
      const res = await this.client!.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket!,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        }),
      );
      for (const e of res.Errors ?? []) {
        this.logger.warn(`Xóa backup cũ thất bại (key=${e.Key}): ${e.Message}`);
      }
    }

    return keys;
  }
}
