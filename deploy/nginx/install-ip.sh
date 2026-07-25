#!/usr/bin/env bash
# Cài nginx chạy bằng IP thô (chưa có domain) cho VPS 103.180.134.112.
# Chạy TRÊN SERVER, quyền sudo. Idempotent — chạy lại nhiều lần không sao.
#
#   scp deploy/nginx/{ip.conf,proxy-inchem.conf,install-ip.sh} root@103.180.134.112:/tmp/
#   ssh root@103.180.134.112 'bash /tmp/install-ip.sh'
set -euo pipefail

SRC=${SRC:-$(cd "$(dirname "$0")" && pwd)}

command -v nginx >/dev/null || { apt-get update && apt-get install -y nginx; }

install -d /etc/nginx/snippets
install -m 644 "$SRC/proxy-inchem.conf" /etc/nginx/snippets/proxy-inchem.conf
install -m 644 "$SRC/ip.conf"           /etc/nginx/sites-available/ip.conf

# Chỉ được bật một bộ conf: ip.conf hoặc {catchall,web,api,admin}.conf.
# catchall.conf cũng phải tắt: nó giữ "listen 80 default_server", trùng với ip.conf.
rm -f /etc/nginx/sites-enabled/default \
      /etc/nginx/sites-enabled/api-ip.conf \
      /etc/nginx/sites-enabled/catchall.conf \
      /etc/nginx/sites-enabled/web.conf \
      /etc/nginx/sites-enabled/api.conf \
      /etc/nginx/sites-enabled/admin.conf
ln -sfn /etc/nginx/sites-available/ip.conf /etc/nginx/sites-enabled/ip.conf

nginx -t
systemctl reload nginx || systemctl restart nginx
systemctl enable nginx

# Firewall: 22 (ssh) + 80 (web) + 8080 (admin). 8081 (api) chỉ mở nếu cần curl
# kiểm tra từ ngoài — web/admin gọi api qua network nội bộ Docker, không cần port này.
if command -v ufw >/dev/null; then
	ufw allow 22/tcp   >/dev/null || true
	ufw allow 80/tcp   >/dev/null || true
	ufw allow 8080/tcp >/dev/null || true
	# ufw allow 8081/tcp
	ufw --force enable >/dev/null || true
	ufw status
fi

echo
echo "Kiểm tra tại chỗ (phải ra 200/3xx, không phải 502):"
for p in 80 8080; do
	printf '  :%-5s → %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$p/")"
done
echo
echo "  web   → http://103.180.134.112"
echo "  admin → http://103.180.134.112:8080"
