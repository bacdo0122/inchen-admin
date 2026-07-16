/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cho phép import trực tiếp package workspace dạng source-only (TS chưa build).
  transpilePackages: ['@inchem/shared'],
  images: {
    // Ảnh tin tức/sản phẩm/bảng màu upload lên Cloudflare R2 (xem apps/api upload).
    // Nếu dùng custom domain cho R2, thêm hostname tương ứng vào đây.
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
