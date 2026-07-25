#!/bin/bash
# Sinh /etc/nginx/snippets/cloudflare-realip.conf từ dải IP hiện hành của Cloudflare.
#
# Khi bật Cloudflare proxy, mọi request tới Nginx đều xuất phát từ IP Cloudflare.
# Không có file này thì limit_req, log và rate-limit của NestJS đều nhìn thấy
# cùng một IP cho tất cả khách → chặn nhầm hàng loạt.
#
# Cài:  sudo ./cloudflare-realip.sh && sudo nginx -t && sudo systemctl reload nginx
# Dải IP Cloudflare hiếm khi đổi; chạy lại mỗi tháng qua cron cho chắc.

set -euo pipefail

OUT=/etc/nginx/snippets/cloudflare-realip.conf
TMP=$(mktemp)

{
	echo "# Tự sinh bởi cloudflare-realip.sh — đừng sửa tay."
	for url in https://www.cloudflare.com/ips-v4 https://www.cloudflare.com/ips-v6; do
		curl -fsS --max-time 15 "$url" | while read -r cidr; do
			[ -n "$cidr" ] && echo "set_real_ip_from $cidr;"
		done
	done
	# Cloudflare gửi IP gốc của khách trong header này.
	echo "real_ip_header CF-Connecting-IP;"
} > "$TMP"

# Sanity check: phải có ít nhất vài chục dải, tránh ghi đè bằng file rỗng khi curl lỗi.
if [ "$(grep -c set_real_ip_from "$TMP")" -lt 10 ]; then
	echo "❌ Lấy danh sách IP Cloudflare thất bại, giữ nguyên file cũ" >&2
	rm -f "$TMP"
	exit 1
fi

mkdir -p "$(dirname "$OUT")"
mv "$TMP" "$OUT"
chmod 644 "$OUT"
echo "✅ Đã ghi $OUT ($(grep -c set_real_ip_from "$OUT") dải IP)"
