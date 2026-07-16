import type { Config } from 'tailwindcss';

/**
 * Design system web public — trích từ Figma "Sơn Inchem".
 * Token màu khai báo qua CSS variable trong globals.css để đổi một chỗ.
 *
 * - navy   : nền hero + section sản phẩm (#15233f)
 * - brand  : vàng nhấn INCHEM (#ffcc00)
 * - amber  : thanh top bar header (#fbac2b)
 * - indigo : chữ tên thương hiệu "MINH HIỀN - INCHEM" (#0e1880)
 * - cta    : nút hành động cam
 * - teal   : nút gửi form (#35bccb)
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: 'hsl(var(--navy))',
          light: 'hsl(var(--navy-light))',
          fg: 'hsl(var(--navy-fg))',
        },
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          fg: 'hsl(var(--brand-fg))',
        },
        amber: 'hsl(var(--amber))',
        indigo: 'hsl(var(--indigo))',
        cta: {
          DEFAULT: 'hsl(var(--cta))',
          fg: 'hsl(var(--cta-fg))',
        },
        teal: {
          DEFAULT: 'hsl(var(--teal))',
          fg: 'hsl(var(--teal-fg))',
        },
        surface: 'hsl(var(--surface))',
        panel: 'hsl(var(--panel))',
        section: 'hsl(var(--section))',
        border: 'hsl(var(--border))',
        muted: 'hsl(var(--muted))',
        'muted-fg': 'hsl(var(--muted-fg))',
        fg: 'hsl(var(--fg))',
        swatch: 'hsl(var(--swatch))',
      },
      maxWidth: {
        content: '1200px',
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(15 35 63 / 0.18)',
        'card-hover': '0 12px 32px -10px rgb(15 35 63 / 0.28)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
