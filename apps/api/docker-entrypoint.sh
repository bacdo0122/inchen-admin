#!/bin/sh
set -e

echo "▶ Áp dụng migration (prisma migrate deploy)..."
./node_modules/.bin/prisma migrate deploy

echo "▶ Khởi động API..."
exec "$@"
