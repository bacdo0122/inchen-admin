# @inchem/admin — Trang quản trị (CMS)

Trang quản trị nội bộ cho nhân viên Minh Hiền: quản lý **tin tức, sản phẩm, bảng màu** và theo dõi **yêu cầu báo giá (lead)**. Next.js 15 (App Router).

## Chạy

```bash
pnpm install

cp apps/admin/.env.example apps/admin/.env.local
#   → API_BASE_URL trỏ tới backend (mặc định http://localhost:4000/api)
#   → WEB_REVALIDATE_URL / WEB_REVALIDATE_SECRET (khớp với apps/web) nếu đã có web

pnpm --filter @inchem/admin dev     # http://localhost:3001
```

Đăng nhập bằng tài khoản admin đã seed bên `apps/api` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Kiến trúc

- **Auth**: JWT lưu trong cookie **httpOnly** (`admin_token`) — không lộ token ra client.
  `middleware.ts` chặn mọi route khi chưa đăng nhập; backend vẫn bắt buộc auth qua JwtAuthGuard.
- **Đọc dữ liệu**: Server Components gọi API kèm Bearer token, `cache: 'no-store'`
  (`export const dynamic = 'force-dynamic'`) — **admin không dùng ISR**, dữ liệu luôn mới nhất.
- **Ghi dữ liệu**: Server Actions (`src/actions/*`) gọi backend, rồi:
  - `revalidatePath(...)` để làm mới chính trang admin;
  - `revalidateWeb([...tags])` **best-effort** để web public (`apps/web`) cập nhật ISR ngay.
    Lỗi revalidate KHÔNG làm hỏng thao tác lưu.
- **Upload ảnh**: proxy qua `POST /api/upload` (gắn token server-side) → Cloudinary ở backend.
- **UI**: Tailwind (màu nhấn thương hiệu qua CSS var `--brand` trong `globals.css` — đổi 1 chỗ
  khi có token Figma của web public), form dùng react-hook-form + zod, rich text dùng Tiptap.

## Tag revalidate (thống nhất với apps/web)

`posts` · `post:<slug>` · `products` · `product:<slug>` · `colors`
