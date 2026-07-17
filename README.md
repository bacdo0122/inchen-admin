# Website Sơn INCHEM — Minh Hiền (monorepo)

Website giới thiệu & tạo lead cho **Công ty TNHH DV TM và SX Minh Hiền** — nhà phân phối sơn gỗ INCHEM (Sherwin-Williams) miền Bắc. Tên miền: `inchemminhhien.com.vn`.

## Cấu trúc

```
inchem-minhhien/
├─ apps/
│  ├─ api/        # Backend NestJS + Prisma + PostgreSQL (CMS & lead)   ✅ đã dựng
│  ├─ web/        # Frontend public Next.js                            ✅ đã dựng
│  └─ admin/      # Trang quản trị Next.js                             ⏳ (admin-dev)
└─ packages/
   └─ shared/     # Types/enums/hằng số dùng chung
```

## Yêu cầu
- Node >= 20, pnpm >= 10
- PostgreSQL (local hoặc cloud) — trỏ qua `DATABASE_URL`

## Chạy backend (apps/api)

```bash
pnpm install

# 1) Tạo file env
cp apps/api/.env.example apps/api/.env
#   → sửa DATABASE_URL, JWT_SECRET, ADMIN_*, SMTP_*, CLOUDINARY_*

# 2) Sinh Prisma client + migrate schema
pnpm --filter @inchem/api prisma:generate
pnpm --filter @inchem/api prisma:migrate      # tạo bảng

# 3) Seed admin + danh mục sản phẩm + màu mẫu
pnpm --filter @inchem/api prisma:seed

# 4) Chạy dev
pnpm api:dev            # http://localhost:4000/api
#   Swagger: http://localhost:4000/api/docs
```

## API chính

| Nhóm | Public | Admin (cần Bearer token) |
|------|--------|--------------------------|
| auth | `POST /api/auth/login` | `GET /api/auth/me` |
| products | `GET /api/products`, `GET /api/products/:slug` | `GET /api/products/admin/all`, `POST/PATCH/DELETE` |
| posts | `GET /api/posts`, `GET /api/posts/:slug` | `GET /api/posts/admin/all`, `GET /api/posts/admin/:id`, `POST/PATCH/DELETE` |
| colors | `GET /api/colors?tone=WARM` | `POST/PATCH/DELETE` |
| leads | `POST /api/leads` (form liên hệ) | `GET /api/leads`, `GET /api/leads/count-new`, `PATCH /:id/status`, `DELETE` |
| upload | — | `POST /api/upload/image` (multipart) |

## Ghi chú
- **Lead**: lưu DB trước, gửi email sau (mail lỗi không làm mất lead). Có honeypot + rate limit chống spam.
- **Email**: cấu hình SMTP qua biến env (`SMTP_*`, `MAIL_TO`).
- **Ảnh**: upload lên Cloudflare R2 (`R2_*`, API tương thích S3) — xem `apps/api/src/upload`.
- **Web public** (`apps/web`, cổng 3000): Next.js App Router, dựng theo Figma. SSG + ISR theo thời gian (`revalidate` 60 giây). SEO: metadata/OG, JSON-LD, `sitemap.xml`, `robots.txt`. Form liên hệ gửi qua server action → `POST /api/leads`.
- **Sản phẩm click ở web** → cuộn về khối liên hệ (xử lý phía frontend).
