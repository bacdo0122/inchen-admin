import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Gói server + node_modules tối thiểu vào .next/standalone để chạy trong Docker
  // (image ~150MB thay vì ~1GB nếu bê nguyên node_modules).
  output: 'standalone',
  // Monorepo: phải trace từ gốc repo, nếu không standalone thiếu file của @inchem/shared.
  outputFileTracingRoot: path.join(__dirname, '../..'),
  // Cho phép import trực tiếp package workspace dạng source-only (TS chưa build).
  transpilePackages: ['@inchem/shared'],
  images: {
    // Ảnh sản phẩm/tin tức/bảng màu upload lên Cloudflare R2 — xem apps/api upload.
    // Public Development URL (*.r2.dev) đã có sẵn; nếu dùng custom domain cho R2,
    // thêm hostname tương ứng (vd: cdn.inchemminhhien.com.vn) vào đây.
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'resouce.minhhieninchem.com.vn' },
    ],
  },
};

export default nextConfig;
