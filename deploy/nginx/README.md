# Nginx cho VPS 103.180.134.112 — runbook

Hai bộ conf, **chỉ được bật một bộ** (cùng khai báo `map`/`limit_req_zone`/`upstream`
ở http context, bật cả hai thì `nginx -t` fail ngay):

| Bộ | File | Khi nào dùng | Cài bằng |
|---|---|---|---|
| Domain | `catchall.conf` + `api.conf` + `web.conf` + `admin.conf` | Đã có domain trên Cloudflare | `install-domain.sh` |
| IP thô | `ip.conf` | Chưa có domain, chỉ test | `install-ip.sh` |

`api.conf`/`web.conf`/`admin.conf` là **template**: chứa `__DOMAIN__`, phải render
qua `install-domain.sh` mới dùng được. Đừng `cp` tay vào `/etc/nginx`.

---

## Bộ domain — 5 bước

### Bước 1. Cloudflare: DNS

Dashboard → chọn zone `1clickswaps.xyz` → **DNS → Records**. Cần 4 record, tất cả
**Proxied (mây CAM)**:

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `103.180.134.112` | Proxied |
| A | `www` | `103.180.134.112` | Proxied |
| A | `api` | `103.180.134.112` | Proxied |
| A | `admin` | `103.180.134.112` | Proxied |

Mây xám (DNS only) sẽ làm trình duyệt nhận trực tiếp Origin Certificate → báo
`ERR_CERT_AUTHORITY_INVALID`, vì cert đó chỉ Cloudflare tin.

### Bước 2. Cloudflare: SSL mode + Origin Certificate

**SSL/TLS → Overview → Configure → Full (strict)**.
Đừng chọn `Flexible`: Cloudflare sẽ gọi origin bằng HTTP :80, nginx `return 301
https` → Cloudflare lại gọi HTTP → vòng lặp, trình duyệt báo
`ERR_TOO_MANY_REDIRECTS`.

**SSL/TLS → Origin Server → Create Certificate**:
- Giữ mặc định *Generate private key and CSR with Cloudflare*, RSA 2048
- Hostnames: `1clickswaps.xyz` và `*.1clickswaps.xyz` (thiếu dấu `*` là 3
  subdomain fail hết)
- Validity 15 năm

Hiện ra 2 khối text. **Private key chỉ hiện MỘT LẦN**, đóng tab là mất, phải tạo
cert mới. Đưa lên server:

```bash
ssh root@103.180.134.112

# Dán khối "Origin Certificate" (-----BEGIN CERTIFICATE----- ... END)
cat > /tmp/origin.pem <<'EOF'
<dán vào đây>
EOF

# Dán khối "Private Key" (-----BEGIN PRIVATE KEY----- ... END)
cat > /tmp/origin.key <<'EOF'
<dán vào đây>
EOF
```

Dùng `<<'EOF'` (có nháy đơn) để bash không diễn giải ký tự trong nội dung.
Kiểm tra trước khi chạy tiếp — hai lệnh này phải in ra thông tin cert, không lỗi:

```bash
openssl x509 -in /tmp/origin.pem -noout -subject -dates
openssl rsa  -in /tmp/origin.key -noout -check
```

### Bước 3. Copy conf lên server

Từ máy local, trong repo:

```bash
ssh root@103.180.134.112 'mkdir -p /tmp/nginx-conf'
scp deploy/nginx/*.conf deploy/nginx/*.sh root@103.180.134.112:/tmp/nginx-conf/
```

### Bước 4. Chạy script

```bash
ssh root@103.180.134.112 'DOMAIN=1clickswaps.xyz bash /tmp/nginx-conf/install-domain.sh'
```

Script làm 6 việc, theo thứ tự — hỏng ở đâu là dừng ở đó (`set -euo pipefail`),
nginx đang chạy không bị ảnh hưởng vì `nginx -t` đứng trước `reload`.

**4.1 — Cert.** Tạo `/etc/ssl/cloudflare/1clickswaps.xyz/`, copy `origin.pem`
(644) và `origin.key` (600) vào. Chưa có file ở `/tmp` → in hướng dẫn bước 2 rồi
`exit 1`, không sửa gì cả. Có cert rồi thì bỏ qua (chạy lại script an toàn).
Sau đó `openssl x509 -checkhost api.1clickswaps.xyz`; không khớp thì **cảnh báo
nhưng vẫn chạy tiếp** — nếu thấy dòng ⚠️ này thì cert thiếu `*.domain`, tạo lại.

Đường dẫn cert có kèm domain (`/etc/ssl/cloudflare/<domain>/`) để chạy song song
2 domain trên cùng server được — mỗi zone Cloudflare có origin cert riêng.

**4.2 — Snippets.**
- `snippets/proxy-inchem.conf`: header `Host`/`X-Forwarded-*` cho container.
- `snippets/cloudflare-realip.conf`: sinh bởi `cloudflare-realip.sh`, curl 2 URL
  dải IP của Cloudflare → `set_real_ip_from` + `real_ip_header CF-Connecting-IP`.
  Script tự kiểm tra phải có ≥10 dải, không thì giữ file cũ và `exit 1` (tránh
  ghi đè bằng file rỗng khi mạng lỗi). **Thiếu file này thì `$remote_addr` là IP
  Cloudflare cho mọi khách** → `limit_req` gộp cả thế giới vào 1 hạn mức, 1 bot
  quét là cả web nhận 429; log cũng chỉ toàn IP Cloudflare.
- Cài `cloudflare-realip.sh` vào `/usr/local/sbin/` + `/etc/cron.d/cloudflare-realip`
  chạy 04:17 ngày 1 hằng tháng rồi reload nginx.
- Tạo `/var/www/certbot` cho ACME http-01, để sẵn nếu sau này đổi sang Let's Encrypt.

**4.3 — Render.** `sed 's/__DOMAIN__/1clickswaps.xyz/g'` từng file vào
`/etc/nginx/sites-available/`. `catchall.conf` copy thẳng (không có placeholder).

**4.4 — Bật/tắt.** Xoá symlink `default`, `ip.conf`, `api-ip.conf` khỏi
`sites-enabled/`, rồi `ln -sfn` 4 file `catchall,api,web,admin`. Thứ tự nạp là
alphabet nên `api.conf` — nơi khai báo `map`/`upstream` — luôn được đọc trước
`web.conf`/`admin.conf`; `catchall` nằm trước cả nhóm.

**4.5 — Firewall.** ufw mở 22/80/443, xoá rule 8080/8081 của bộ IP. Chỉ
Cloudflare cần vào 80/443. Kiểm tra thêm firewall của nhà cung cấp VPS nếu có.

**4.6 — Tự kiểm tra.** curl 3 host bằng `--resolve <host>:443:127.0.0.1` để
**bỏ qua DNS, gọi thẳng nginx trên máy** — tách được lỗi origin và lỗi
Cloudflare. Kèm `-k` vì origin cert không do CA công khai ký.

Kỳ vọng:

```
  1clickswaps.xyz              → 200
  admin.1clickswaps.xyz        → 307      (middleware đá về /login, đúng)
  api.1clickswaps.xyz          → 404      (NestJS prefix /api, GET / không có route)
  api.1clickswaps.xyz/api/products → 200
```

`502` = container không chạy → `docker compose -f /opt/inchem/docker-compose.prod.yml ps`.
`000`/`ERR` = nginx chưa listen 443, xem `systemctl status nginx`.

### Bước 5. Kiểm tra từ ngoài

```bash
curl -sI https://1clickswaps.xyz            | head -1
curl -sI https://admin.1clickswaps.xyz      | head -1
curl -s  https://api.1clickswaps.xyz/api/products | head -c 200
curl -sI http://1clickswaps.xyz             | head -3   # phải 301 → https
curl -sI https://www.1clickswaps.xyz        | head -3   # phải 301 → apex
```

`/cdn-cgi/trace` cho biết Cloudflare đang đứng trước hay không:

```bash
curl -s https://1clickswaps.xyz/cdn-cgi/trace | grep -E '^(colo|ip)='
```

---

## Lỗi hay gặp

| Hiện tượng | Nguyên nhân | Xử lý |
|---|---|---|
| CF `526 Invalid SSL certificate` | Origin cert không phủ hostname, hoặc sai đường dẫn trong conf | `openssl x509 -in /etc/ssl/cloudflare/<domain>/origin.pem -noout -text \| grep -A1 "Subject Alternative"` |
| CF `521 Web server is down` | nginx không chạy, hoặc ufw/firewall chặn 443 | `systemctl status nginx`, `ufw status` |
| CF `522 Timed out` | Firewall nhà cung cấp VPS chặn, không phải ufw | Mở 80/443 ở panel VPS |
| `ERR_TOO_MANY_REDIRECTS` | SSL mode = Flexible | Đổi sang Full (strict) |
| `ERR_CERT_AUTHORITY_INVALID` | Mây xám (DNS only) | Bật lại mây cam |
| `502 Bad Gateway` | container chết / sai port | `docker compose ps`, `docker logs inchem-web` |
| `413 Request Entity Too Large` | upload > `client_max_body_size` | Đã set 20M cho api/admin; free plan Cloudflare chặn ở 100MB |
| Đăng nhập admin xong bị đá ra | cookie `secure` mà truy cập qua HTTP | Phải vào bằng https |
| Mọi khách bị 429 | thiếu `snippets/cloudflare-realip.conf` | `/usr/local/sbin/cloudflare-realip.sh && systemctl reload nginx` |

## Đổi domain — checklist đầy đủ

Ví dụ chuyển `1clickswaps.xyz` → `minhhieninchem.com.vn`.

### 1. Cloudflare zone mới
- Add site, đổi nameserver ở nhà cung cấp domain, chờ zone Active.
- 4 A record `@` / `www` / `api` / `admin` → `103.180.134.112`, **mây CAM**.
- SSL/TLS → **Full (strict)**.
- SSL/TLS → Origin Server → Create Certificate, hostnames
  `minhhieninchem.com.vn, *.minhhieninchem.com.vn`. Lưu ra `/tmp/origin.{pem,key}`.

Record đã proxied thì đổi A record có hiệu lực trong vài giây — không cần hạ TTL.

### 2. nginx (1 lệnh, không sửa file)
```bash
DOMAIN=minhhieninchem.com.vn PEM=/tmp/origin.pem KEY=/tmp/origin.key \
  bash /tmp/nginx-conf/install-domain.sh
```
Cert vào `/etc/ssl/cloudflare/minhhieninchem.com.vn/` — domain cũ vẫn còn cert
riêng, chạy song song 2 domain được nếu muốn giai đoạn chuyển tiếp.

### 3. GitHub repository variables — RỒI CHẠY LẠI DEPLOY
Đây là bước duy nhất **không** chỉ cần reload: cả hai biến bake vào image lúc build.

| Variable | Giá trị mới | Ảnh hưởng nếu quên |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://minhhieninchem.com.vn` | `metadataBase`, canonical, OG, `sitemap.xml`, `robots.txt`, JSON-LD breadcrumb đều trỏ domain cũ |
| `API_BASE_URL` | `https://api.minhhieninchem.com.vn/api` | job build web prerender ISR bằng URL này → domain cũ chết là build fail / trang trắng |

Phải là **repository**-level variable, KHÔNG phải environment `production`: job
`build` không khai báo `environment: production` (chỉ job `deploy` có) nên biến ở
environment sẽ không resolve lúc build.

Xong thì Actions → Deploy → Run workflow (để trống `image_tag` để build lại).

### 4. Fallback hardcode trong code (nên sửa cho khỏi để domain chết)
Repo variable thắng fallback, nên không sửa cũng chạy — nhưng khi variable bị xoá
thì site âm thầm trỏ domain cũ:
- `apps/web/src/lib/env.ts` — 2 chỗ `'https://minhhieninchem.com.vn'`
- `.github/workflows/deploy.yml` — `vars.API_BASE_URL || ...` và `vars.NEXT_PUBLIC_SITE_URL || ...`

### 5. Trên server: `/opt/inchem/.env`
- `CORS_ORIGINS` — nếu có set thì thêm domain mới. Để rỗng = cho mọi origin;
  hiện web/admin gọi API server-side nên không ảnh hưởng khách.
- `MAIL_FROM` — nếu muốn gửi từ `no-reply@<domain mới>` thì phải **verify domain
  mới trên Resend** trước, không thì mail lead im lặng không gửi được.

### 6. Không cần làm gì
- Cookie phiên admin: `sameSite: lax` + không set `domain` → host-only, tự đúng
  theo domain mới. Chỉ là đang đăng nhập ở domain cũ thì phải login lại.
- Ảnh: R2 (`**.r2.dev`) không phụ thuộc domain site. Chỉ khi đổi sang custom
  domain cho R2 mới phải thêm hostname vào `remotePatterns` của **cả**
  `apps/web/next.config.mjs` và `apps/admin/next.config.mjs`.

### 7. SEO khi domain cũ đã được index
- Giữ zone cũ, thêm Cloudflare **Redirect Rule**: `*` → `https://<domain mới>/$1`, 301.
- Google Search Console: thêm property mới, submit `sitemap.xml`, dùng
  **Change of Address** từ domain cũ.
- HSTS `max-age=31536000` đã bật: trình duyệt từng vào domain cũ sẽ ép HTTPS cho
  domain đó trong 1 năm → redirect rule phải chạy trên HTTPS, không chỉ HTTP.

## Quay lại bộ IP

```bash
bash /tmp/nginx-conf/install-ip.sh
```

Tự tắt bộ domain trước khi bật `ip.conf`.
