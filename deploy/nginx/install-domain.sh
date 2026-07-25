#!/usr/bin/env bash
# Cài nginx cho domain thật (Cloudflare proxy + Origin Certificate).
# Render __DOMAIN__ trong {api,web,admin}.conf rồi bật, tắt bộ conf IP.
#
#   __DOMAIN__            → web public   (127.0.0.1:3000)
#   admin.__DOMAIN__      → admin CMS    (127.0.0.1:3001)
#   api.__DOMAIN__        → API NestJS   (127.0.0.1:4000)
#   www.__DOMAIN__        → 301 về apex
#
# Chạy TRÊN SERVER, quyền sudo. Idempotent.
#
#   scp deploy/nginx/*.conf deploy/nginx/*.sh root@103.180.134.112:/tmp/nginx-conf/
#   ssh root@103.180.134.112 'DOMAIN=1clickswaps.xyz bash /tmp/nginx-conf/install-domain.sh'
#
# Cert: lấy ở Cloudflare → SSL/TLS → Origin Server → Create Certificate,
# hostnames "1clickswaps.xyz, *.1clickswaps.xyz". Lưu 2 file rồi truyền vào:
#   PEM=/tmp/origin.pem KEY=/tmp/origin.key DOMAIN=... bash install-domain.sh
set -euo pipefail

DOMAIN=${DOMAIN:-1clickswaps.xyz}
SRC=${SRC:-$(cd "$(dirname "$0")" && pwd)}
CERT_DIR=/etc/ssl/cloudflare/$DOMAIN
PEM=${PEM:-/tmp/origin.pem}
KEY=${KEY:-/tmp/origin.key}

command -v nginx >/dev/null || { apt-get update && apt-get install -y nginx; }
command -v curl  >/dev/null || apt-get install -y curl

# ── 1. Cloudflare Origin Certificate ──────────────────────
install -d -m 755 "$CERT_DIR"
if [ ! -s "$CERT_DIR/origin.pem" ] || [ ! -s "$CERT_DIR/origin.key" ]; then
	if [ -s "$PEM" ] && [ -s "$KEY" ]; then
		install -m 644 "$PEM" "$CERT_DIR/origin.pem"
		install -m 600 "$KEY" "$CERT_DIR/origin.key"
		echo "✅ Đã cài cert vào $CERT_DIR"
	else
		cat >&2 <<EOF
❌ Chưa có cert tại $CERT_DIR/origin.{pem,key}

Vào Cloudflare dashboard → chọn $DOMAIN → SSL/TLS → Origin Server →
Create Certificate → giữ mặc định RSA 2048, hostnames:

    $DOMAIN, *.$DOMAIN

Copy "Origin Certificate" ra $PEM, "Private Key" ra $KEY (key chỉ hiện
MỘT LẦN, không lấy lại được), rồi chạy lại script này.
EOF
		exit 1
	fi
fi

# Cert phải khớp domain, nếu không Cloudflare Full (strict) sẽ trả 526.
if ! openssl x509 -in "$CERT_DIR/origin.pem" -noout -checkhost "api.$DOMAIN" >/dev/null 2>&1; then
	echo "⚠️  Cert ở $CERT_DIR không phủ api.$DOMAIN — kiểm tra lại hostnames khi tạo cert." >&2
fi

# ── 2. Snippets ───────────────────────────────────────────
install -d /etc/nginx/snippets
install -m 644 "$SRC/proxy-inchem.conf" /etc/nginx/snippets/proxy-inchem.conf

# Dải IP Cloudflare — thiếu file này thì limit_req gộp mọi khách vào 1 hạn mức.
install -m 755 "$SRC/cloudflare-realip.sh" /usr/local/sbin/cloudflare-realip.sh
/usr/local/sbin/cloudflare-realip.sh
# Dải IP hiếm khi đổi, nhưng có đổi thì log và rate-limit sai âm thầm → cron.
printf '17 4 1 * * root /usr/local/sbin/cloudflare-realip.sh >/dev/null 2>&1 && systemctl reload nginx\n' \
	> /etc/cron.d/cloudflare-realip
chmod 644 /etc/cron.d/cloudflare-realip

# Thư mục cho ACME http-01, dùng nếu sau này đổi sang Let's Encrypt.
install -d -m 755 /var/www/certbot

# ── 3. Render conf theo domain ────────────────────────────
for f in api web admin; do
	sed "s/__DOMAIN__/$DOMAIN/g" "$SRC/$f.conf" > "/etc/nginx/sites-available/$f.conf"
	chmod 644 "/etc/nginx/sites-available/$f.conf"
done
install -m 644 "$SRC/catchall.conf" /etc/nginx/sites-available/catchall.conf

# ── 4. Bật bộ domain, tắt bộ IP ───────────────────────────
# ip.conf/api-ip.conf khai báo trùng map + upstream với api.conf → phải tắt.
rm -f /etc/nginx/sites-enabled/default \
      /etc/nginx/sites-enabled/ip.conf \
      /etc/nginx/sites-enabled/api-ip.conf
for f in catchall api web admin; do
	ln -sfn "/etc/nginx/sites-available/$f.conf" "/etc/nginx/sites-enabled/$f.conf"
done

nginx -t
systemctl reload nginx || systemctl restart nginx
systemctl enable nginx

# ── 5. Firewall ───────────────────────────────────────────
# Chỉ Cloudflare cần vào 80/443. 8080/8081 của bản chạy IP đóng lại.
if command -v ufw >/dev/null; then
	ufw allow 22/tcp  >/dev/null || true
	ufw allow 80/tcp  >/dev/null || true
	ufw allow 443/tcp >/dev/null || true
	ufw delete allow 8080/tcp >/dev/null 2>&1 || true
	ufw delete allow 8081/tcp >/dev/null 2>&1 || true
	ufw --force enable >/dev/null || true
	ufw status
fi

# ── 6. Tự kiểm tra ────────────────────────────────────────
# Bỏ qua DNS/Cloudflare, gọi thẳng nginx trên máy: tách lỗi origin và lỗi CF.
echo
echo "Kiểm tra tại chỗ (-k vì origin cert chỉ Cloudflare tin):"
for h in "$DOMAIN" "admin.$DOMAIN" "api.$DOMAIN"; do
	code=$(curl -sk -o /dev/null -w '%{http_code}' --resolve "$h:443:127.0.0.1" "https://$h/" || echo ERR)
	printf '  %-28s → %s\n' "$h" "$code"
done
echo
echo "  api.$DOMAIN/api/products → $(curl -sk -o /dev/null -w '%{http_code}' --resolve "api.$DOMAIN:443:127.0.0.1" "https://api.$DOMAIN/api/products" || echo ERR)"
echo
echo "Nhớ ở Cloudflare: A record @ / www / api / admin → 103.180.134.112, mây CAM,"
echo "và SSL/TLS mode = Full (strict). Flexible sẽ gây redirect loop."
