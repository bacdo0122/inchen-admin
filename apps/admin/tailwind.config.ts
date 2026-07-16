import type { Config } from 'tailwindcss';

/**
 * Design system admin — tách bạch với web public bằng nền trung tính.
 *
 * MÀU NHẤN (accent/brand) khai báo qua CSS variable trong globals.css
 * (`--brand`, `--brand-fg`). Khi frontend-dev đã trích design token từ Figma
 * của web public, chỉ cần đổi giá trị biến đó ở MỘT chỗ — không sửa rải rác.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Màu nhấn thương hiệu (placeholder — đổi theo token Figma của web public)
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          fg: 'hsl(var(--brand-fg))',
          muted: 'hsl(var(--brand-muted))',
        },
        // Nền/kết cấu khung admin (trung tính)
        surface: 'hsl(var(--surface))',
        panel: 'hsl(var(--panel))',
        border: 'hsl(var(--border))',
        muted: 'hsl(var(--muted))',
        'muted-fg': 'hsl(var(--muted-fg))',
        fg: 'hsl(var(--fg))',
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '0.875rem',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
