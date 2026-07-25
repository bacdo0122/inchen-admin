#!/usr/bin/env bash
# Chạy TRÊN EC2, được GitHub Actions scp lên rồi gọi.
#
# Để nguyên logic trong file thay vì nhét vào khối `script:` của ssh-action:
# action đó chèn thêm dòng vào script trước khi gửi, làm vỡ các khối nhiều dòng
# (case/esac, khai báo hàm). File riêng thì kiểm tra được bằng `bash -n` ở local.
#
# Biến môi trường cần có: TAG, GHCR_USER, GHCR_TOKEN, DEPLOY_DIR

set -euo pipefail

COMPOSE_FILE=docker-compose.prod.yml
CONTAINERS="inchem-api inchem-web inchem-admin"
MAX_TRIES=40   # × 5s = 200s cho mỗi container

cd "$DEPLOY_DIR"

# ── .env sinh từ GitHub Secrets, copy lên ở bước trước ─────
if [ ! -f env.production ]; then
	echo "❌ Không thấy env.production vừa copy lên"
	exit 1
fi
mv -f env.production .env
chmod 600 .env
mkdir -p backups

echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin

export API_TAG="$TAG" WEB_TAG="$TAG" ADMIN_TAG="$TAG"
echo "▶ Deploy tag: $TAG"

# ── Dọn TRƯỚC khi pull: lúc pull là lúc đĩa căng nhất ──────
echo "▶ Dung lượng trước khi dọn:"
df -h / | tail -1
docker image prune -af --filter 'until=168h' || true
docker builder prune -f --filter 'until=168h' || true

docker compose -f "$COMPOSE_FILE" pull
# Entrypoint của api tự chạy `prisma migrate deploy` trước khi start.
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

echo "▶ Trạng thái ngay sau khi up:"
docker compose -f "$COMPOSE_FILE" ps -a

# ── Chờ healthy ────────────────────────────────────────────
# In ra: healthy / unhealthy / starting, hoặc trạng thái container nếu
# service đó không khai báo healthcheck.
probe() {
	docker inspect \
		-f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
		"$1" 2>&1 || echo inspect-failed
}

echo "▶ Chờ các container healthy..."
failed=""
for c in $CONTAINERS; do
	st=$(probe "$c")
	i=0
	while [ "$i" -lt "$MAX_TRIES" ]; do
		case "$st" in
			healthy | unhealthy | exited | dead | inspect-failed | *"No such object"*)
				break
				;;
		esac
		i=$((i + 1))
		sleep 5
		st=$(probe "$c")
		if [ $((i % 6)) -eq 0 ]; then
			echo "    ... $c: $st ($((i * 5))s)"
		fi
	done
	echo "  $c → $st"
	if [ "$st" != healthy ]; then
		failed="$failed $c"
	fi
done

if [ -n "$failed" ]; then
	echo "❌ Không healthy:$failed"
	for c in $failed; do
		echo "── log $c ──"
		docker logs --tail=80 "$c" 2>&1 || true
	done
	docker logout ghcr.io || true
	exit 1
fi

echo "✅ Deploy xong"
docker compose -f "$COMPOSE_FILE" ps
docker image prune -f
echo "▶ Dung lượng sau khi deploy:"
df -h / | tail -1
docker logout ghcr.io
