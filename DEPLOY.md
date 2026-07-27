# Deploy API + DB lên AWS EC2

Runbook từ lúc có tài khoản AWS đến khi `https://api.minhhieninchem.com.vn` chạy được,
và mỗi lần `git push` sau đó tự deploy.

Kiến trúc: GitHub Actions build image → đẩy lên GHCR → SSH vào EC2 → `docker compose pull && up -d`.
EC2 chỉ chạy 2 container (`inchem-db`, `inchem-api`) + Caddy cài trực tiếp trên host làm HTTPS.

| File | Vai trò |
|---|---|
| `apps/api/Dockerfile` | build image API (context = gốc repo) |
| `apps/api/docker-entrypoint.sh` | chạy `prisma migrate deploy` rồi start API |
| `docker-compose.yml` | chạy local (build tại chỗ) |
| `docker-compose.prod.yml` | chạy trên EC2 (pull image từ GHCR) |
| `.github/workflows/deploy-api.yml` | CI/CD |

---

## Bước 1 — Tạo EC2

EC2 → Launch instance:

- **AMI**: Ubuntu Server 24.04 LTS
- **Instance type**: `t3.small` (2 vCPU / 2GB). `t3.micro` 1GB chạy được nhưng Postgres +
  Node sẽ rất sát trần, bắt buộc phải bật swap ở bước 3.
- **Key pair**: tạo mới, tải file `.pem` về và giữ kỹ
- **Storage**: 30GB gp3 (mặc định 8GB sẽ đầy vì Docker image)
- **Security group**:

| Type | Port | Source | Ghi chú |
|---|---|---|---|
| SSH | 22 | `0.0.0.0/0` | GitHub Actions dùng IP động nên phải mở. Bù lại: chỉ cho login bằng key + cài fail2ban (bước 3) |
| HTTP | 80 | `0.0.0.0/0` | Caddy cần để xin chứng chỉ Let's Encrypt |
| HTTPS | 443 | `0.0.0.0/0` | |

**Không mở 5432.** Postgres chỉ sống trong network nội bộ của Docker.

Sau khi instance chạy: EC2 → Elastic IPs → Allocate → Associate vào instance.
Không có Elastic IP thì mỗi lần stop/start instance là đổi IP, DNS và secret `EC2_HOST` hỏng theo.

---

## Bước 2 — Trỏ DNS

Tại nhà cung cấp domain, thêm A record:

```
api.minhhieninchem.com.vn   A   <ELASTIC_IP>
```

Kiểm tra (có thể mất vài phút tới vài giờ):
```bash
dig +short api.minhhieninchem.com.vn
```

Phải ra đúng Elastic IP **trước khi** cài Caddy ở bước 4, vì Let's Encrypt cần
resolve được domain mới cấp chứng chỉ.

---

## Bước 3 — Cài Docker & làm cứng server

SSH vào (từ máy local):
```bash
chmod 400 ~/inchem-ec2.pem
ssh -i ~/inchem-ec2.pem ubuntu@<ELASTIC_IP>
```

Chạy trên EC2:

```bash
# Cập nhật + tiện ích
sudo apt update && sudo apt upgrade -y
sudo apt install -y fail2ban unattended-upgrades

# Docker Engine + compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Swap 2GB — Postgres rất dễ bị OOM killer giết khi RAM sát trần
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Múi giờ
sudo timedatectl set-timezone Asia/Ho_Chi_Minh

# Thư mục deploy
sudo mkdir -p /opt/inchem/backups
sudo chown -R $USER:$USER /opt/inchem
```

Chặn login bằng mật khẩu:
```bash
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

Thoát rồi SSH lại (để nhóm `docker` có hiệu lực), kiểm tra:
```bash
exit
ssh -i ~/inchem-ec2.pem ubuntu@<ELASTIC_IP>
docker run --rm hello-world      # chạy được là xong bước này
```

---

## Bước 4 — Cài Caddy làm reverse proxy + HTTPS

API bind ở `127.0.0.1:4000`, không lộ ra ngoài. Caddy đứng trước nhận 443.

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

Ghi cấu hình:
```bash
sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
api.minhhieninchem.com.vn {
	reverse_proxy 127.0.0.1:4000
	encode gzip zstd

	# Giới hạn body — upload ảnh qua API admin
	request_body {
		max_size 20MB
	}

	log {
		output file /var/log/caddy/api.log {
			roll_size 10MB
			roll_keep 3
		}
	}
}
EOF

sudo systemctl reload caddy
sudo systemctl status caddy --no-pager
```

Caddy tự xin chứng chỉ Let's Encrypt và tự gia hạn — không cần certbot, không cần cron.

Lúc này truy cập `https://api.minhhieninchem.com.vn` sẽ ra `502 Bad Gateway` vì API chưa chạy.
Đúng như mong đợi — nghĩa là HTTPS đã hoạt động.

---

## Bước 5 — Tạo SSH key riêng cho GitHub Actions

Đừng nhét file `.pem` gốc vào GitHub. Tạo cặp key riêng để lỡ lộ thì thu hồi được mà
không ảnh hưởng quyền truy cập của bạn.

Trên **máy local**:
```bash
ssh-keygen -t ed25519 -f ~/.ssh/inchem-deploy -C "github-actions" -N ""
cat ~/.ssh/inchem-deploy.pub
```

Trên **EC2**, dán public key vừa in ra:
```bash
echo "ssh-ed25519 AAAA... github-actions" >> ~/.ssh/authorized_keys
```

Kiểm tra từ local:
```bash
ssh -i ~/.ssh/inchem-deploy ubuntu@<ELASTIC_IP> 'echo OK'
```

---

## Bước 6 — Khai báo secret trên GitHub

Repo `bacdo0122/inchen-admin` → Settings → Secrets and variables → Actions.

### 6a. Secret kết nối server

| Secret | Giá trị |
|---|---|
| `EC2_HOST` | Elastic IP |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | **toàn bộ** nội dung `~/.ssh/inchem-deploy` (private key, gồm cả dòng `-----BEGIN...`) |
| `EC2_SSH_PORT` | bỏ qua nếu dùng port 22 |

```bash
gh secret set EC2_HOST    --body "<ELASTIC_IP>"
gh secret set EC2_USER    --body "ubuntu"
gh secret set EC2_SSH_KEY < ~/.ssh/inchem-deploy
```

### 6b. Secret biến môi trường (13 bắt buộc)

```
POSTGRES_USER  POSTGRES_PASSWORD  POSTGRES_DB
JWT_SECRET  CORS_ORIGINS
RESEND_API_KEY  MAIL_FROM  MAIL_TO
R2_ACCOUNT_ID  R2_BUCKET  R2_ACCESS_KEY_ID  R2_SECRET_ACCESS_KEY  R2_PUBLIC_URL
```

Tuỳ chọn: `JWT_EXPIRES_IN` (mặc định `7d`), `R2_FOLDER` (mặc định `images`),
`ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` (chỉ cần khi seed ở bước 8).

Đẩy nhanh từ `.env` local rồi sửa lại các giá trị production:
```bash
grep -E '^[A-Z_]+=' .env | while IFS='=' read -r k v; do gh secret set "$k" --body "$v"; done

gh secret set POSTGRES_PASSWORD --body "$(openssl rand -hex 32)"
gh secret set JWT_SECRET        --body "$(openssl rand -hex 48)"
gh secret set CORS_ORIGINS      --body "https://minhhieninchem.com.vn,https://www.minhhieninchem.com.vn,https://admin.minhhieninchem.com.vn"
gh secret set ADMIN_PASSWORD    --body "<mật khẩu admin mạnh>"
gh secret list
```

> `POSTGRES_PASSWORD` phải dùng `-hex`, **không dùng `-base64`**: ký tự `/` do base64 sinh ra
> sẽ làm hỏng chuỗi `DATABASE_URL` mà compose tự ghép.

Ba giá trị `POSTGRES_USER` / `POSTGRES_DB` / `POSTGRES_PASSWORD` phải **chốt trước lần deploy
đầu tiên** — Postgres chỉ đọc chúng khi khởi tạo volume rỗng, đổi sau sẽ không có tác dụng
và API báo `password authentication failed`.

---

## Bước 7 — Deploy lần đầu

```bash
git add .github docker-compose.prod.yml apps/api/Dockerfile apps/api/docker-entrypoint.sh .dockerignore DEPLOY.md
git commit -m "chore: docker + CI/CD deploy EC2"
git push origin master
```

Theo dõi: repo → tab Actions, hoặc `gh run watch`.

Workflow sẽ: build image → push GHCR → copy `docker-compose.prod.yml` + `.env` lên EC2 →
`docker compose pull` → `up -d` (entrypoint tự chạy migration) → chờ healthcheck.
Không healthy trong ~3 phút thì in 100 dòng log cuối và fail.

Kiểm tra:
```bash
curl https://api.minhhieninchem.com.vn/api/products
```

---

## Bước 8 — Seed dữ liệu (chỉ 1 lần)

Tạo tài khoản admin + 20 sản phẩm + bảng màu mẫu:

```bash
ssh -i ~/inchem-ec2.pem ubuntu@<ELASTIC_IP>
cd /opt/inchem
docker compose -f docker-compose.prod.yml exec api ./node_modules/.bin/ts-node prisma/seed.ts
```

Đăng nhập thử bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD` đã đặt ở bước 6b.

---

## Bước 9 — Backup tự động

Volume nằm trên EBS của đúng một instance. Không backup là mất sạch khi hỏng.
Có **hai lớp độc lập**, cố ý giữ cả hai:

### 9a. Backup lên Cloudflare R2 — do API tự làm (lớp off-site)

`BackupService` trong backend (`apps/api/src/backup/`) chạy cron **1h sáng mỗi ngày
(giờ VN)**: `pg_dump --format=custom` → upload lên R2 → xóa bản cũ hơn
`BACKUP_RETENTION_DAYS` (mặc định 7), nhưng **luôn chừa lại 3 bản mới nhất** để
app chết vài ngày rồi sống lại không xóa sạch backup.

Không cần cấu hình gì trên server ngoài các biến env sau trong `/opt/inchem/.env`
(xem `.env.pro.example`):

```
BACKUP_ENABLED=true
BACKUP_CRON=0 1 * * *
BACKUP_RETENTION_DAYS=7
R2_BACKUP_FOLDER=backup
```

Dùng **chung bucket `R2_BUCKET` với ảnh**, chỉ khác prefix — không cần tạo bucket
hay API token mới. App từ chối khởi động nếu `R2_BACKUP_FOLDER` trùng `R2_FOLDER`.

> **Bucket này đọc được công khai qua `R2_PUBLIC_URL`, và file dump chứa hash mật
> khẩu admin + toàn bộ data lead khách hàng.** Vì vậy tên file có hậu tố random
> 16 byte để không ai đoán được URL (`inchem-<stamp>-<random>.dump`) — bảo mật ở
> đây là "không đoán được tên", không phải "không truy cập được". Đừng để lộ tên
> file hay bật list-objects công khai. Muốn chắc chắn hơn thì chuyển sang một
> bucket riêng không public và đổi `R2_BUCKET` của backup.

Kiểm tra:

```bash
# pg_dump 16 phải có trong image api (được cài từ repo PGDG trong Dockerfile)
docker compose -f docker-compose.prod.yml exec api pg_dump --version

# chạy backup ngay, không đợi 1h sáng (cần JWT admin)
curl -X POST https://<domain-api>/api/backup/run -H "Authorization: Bearer <JWT>"

docker compose -f docker-compose.prod.yml logs api | grep -i backup
```

Restore từ file `.dump` tải về từ R2:

```bash
docker compose -f docker-compose.prod.yml exec -T db \
  pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists \
  < inchem-YYYYMMDD-HHmmss-<random>.dump
```

### 9b. Backup ra đĩa VPS — cron của host (lớp local)

Chạy 2h sáng, giữ 14 ngày, ghi vào `/opt/inchem/backups`. Nhanh để rollback tại chỗ,
nhưng nằm cùng máy với DB nên **không** thay được lớp 9a.

```bash
mkdir -p ~/bin && tee ~/bin/backup-db.sh > /dev/null <<'EOF'
#!/bin/bash
set -euo pipefail
cd /opt/inchem
source .env
STAMP=$(date +%F-%H%M)
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "backups/inchem-$STAMP.sql.gz"
find backups -name 'inchem-*.sql.gz' -mtime +14 -delete
# Không cần sync lên object storage ở đây — bước 9a (API tự backup lên R2) đã lo.
EOF
chmod +x ~/bin/backup-db.sh

( crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/bin/backup-db.sh >> /home/ubuntu/backup.log 2>&1" ) | crontab -
```

Chạy thử ngay một lần và **test restore** ít nhất một lần vào DB tạm — backup chưa từng
restore thử thì chưa tính là có backup.

---

## Vận hành hằng ngày

```bash
cd /opt/inchem

docker compose -f docker-compose.prod.yml ps          # trạng thái + health
docker compose -f docker-compose.prod.yml logs -f api # xem log
docker compose -f docker-compose.prod.yml restart api # restart

docker compose -f docker-compose.prod.yml exec db psql -U inchem -d inchem   # vào DB
df -h && free -h                                       # ổ đĩa & RAM
```

**Đổi biến môi trường**: sửa secret trên GitHub → Actions → Run workflow. Không SSH.

**Rollback**: Actions → Run workflow → điền `image_tag` = commit SHA cũ. Job build bị bỏ qua,
chỉ deploy lại image cũ. Hoặc ngay trên server:
```bash
API_TAG=<sha-cũ> docker compose -f docker-compose.prod.yml up -d
```

**Nối DBeaver vào DB production**: không mở port 5432. Dùng tab **SSH** trong cửa sổ tạo
connection của DBeaver (host/user/private key của EC2), tab Main để `localhost:5432`.

---

## Xử lý sự cố

| Triệu chứng | Nguyên nhân thường gặp |
|---|---|
| Workflow fail ở step `Dựng file .env` | thiếu secret — log liệt kê đúng tên |
| `password authentication failed for user` | đổi `POSTGRES_PASSWORD` sau khi volume đã tạo. Phải `ALTER USER ... WITH PASSWORD` trong psql rồi mới đổi secret |
| API unhealthy, log `Can't reach database server` | container `db` chưa healthy — `docker compose logs db` |
| `502 Bad Gateway` từ Caddy | container api không chạy hoặc chết lúc migration |
| Lỗi CORS trên trình duyệt | `CORS_ORIGINS` thiếu domain, hoặc thừa dấu `/` ở cuối |
| Ổ đĩa đầy | `docker system prune -af --volumes` (⚠ `--volumes` xoá cả DB — bỏ cờ này ra nếu không chắc) |
| Deploy fail ở step SSH | Security group chặn 22, hoặc `EC2_SSH_KEY` dán thiếu dòng BEGIN/END |
