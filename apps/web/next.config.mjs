/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cho phép import trực tiếp package workspace dạng source-only (TS chưa build).
  transpilePackages: ['@inchem/shared'],
  images: {
    // Ảnh sản phẩm/tin tức/bảng màu upload lên Cloudflare R2 — xem apps/api upload.
    // Public Development URL (*.r2.dev) đã có sẵn; nếu dùng custom domain cho R2,
    // thêm hostname tương ứng (vd: cdn.inchemminhhien.com.vn) vào đây.
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
