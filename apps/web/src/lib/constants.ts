/** Điều hướng chính — khớp nhãn trong Figma (header/footer). */
export const NAV_ITEMS = [
  { label: 'TRANG CHỦ', href: '/' },
  { label: 'GIỚI THIỆU', href: '/gioi-thieu' },
  { label: 'SẢN PHẨM', href: '/san-pham' },
  { label: 'BỘ SƯU TẬP', href: '/bang-mau' },
  { label: 'TIN TỨC', href: '/tin-tuc' },
  { label: 'LIÊN HỆ', href: '/lien-he' },
] as const;

/** Nhãn footer dùng tiếng thường (theo Figma). */
export const FOOTER_NAV = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '/gioi-thieu' },
  { label: 'Sản phẩm', href: '/san-pham' },
  { label: 'Bảng màu', href: '/bang-mau' },
  { label: 'Tin tức', href: '/tin-tuc' },
  { label: 'Liên hệ', href: '/lien-he' },
] as const;

/** Tag cache ISR — thống nhất với admin-dev để revalidate on-demand. */
export const CACHE_TAGS = {
  products: 'products',
  posts: 'posts',
  colors: 'colors',
  product: (slug: string) => `product:${slug}`,
  post: (slug: string) => `post:${slug}`,
} as const;
