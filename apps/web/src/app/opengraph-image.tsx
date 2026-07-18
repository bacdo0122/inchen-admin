import { ImageResponse } from 'next/og';

// Ảnh OG mặc định (og:image) áp dụng cho toàn site.
// Trang chi tiết tin tức tự override bằng thumbnail bài viết.
export const alt = 'Sơn gỗ INCHEM (Sherwin-Williams) — Minh Hiền | Nhà phân phối miền Bắc';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Tải font Be Vietnam Pro từ Google Fonts để render đủ dấu tiếng Việt. */
async function loadFont(weight: number): Promise<ArrayBuffer> {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@${weight}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    })
  ).text();
  const url = css.match(/src:\s*url\((https:\/\/[^)]+)\)/)?.[1];
  if (!url) throw new Error('Không tìm thấy URL font Be Vietnam Pro');
  return (await fetch(url)).arrayBuffer();
}

export default async function OpengraphImage() {
  // Nếu tải font lỗi (mất mạng khi build), vẫn render ảnh bằng font hệ thống.
  let fonts:
    | { name: string; data: ArrayBuffer; weight: 500 | 800; style: 'normal' }[]
    | undefined;
  try {
    const [medium, extraBold] = await Promise.all([loadFont(500), loadFont(800)]);
    fonts = [
      { name: 'Be Vietnam Pro', data: medium, weight: 500, style: 'normal' },
      { name: 'Be Vietnam Pro', data: extraBold, weight: 800, style: 'normal' },
    ];
  } catch {
    fonts = undefined;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#15233f',
          padding: '80px 96px',
          fontFamily: fonts ? 'Be Vietnam Pro' : 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Thanh nhấn vàng bên trái */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 24,
            backgroundColor: '#ffcc00',
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: 2,
            color: '#ffcc00',
            textTransform: 'uppercase',
          }}
        >
          Sherwin-Williams · INCHEM
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.1,
            color: '#ffffff',
          }}
        >
          Sơn gỗ INCHEM cao cấp
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            fontSize: 26,
            fontWeight: 500,
            color: '#9fb0c6',
          }}
        >
          Sơn PU · NC · UV · Hệ nước · Tư vấn phối màu · Báo giá nhanh
        </div>
      </div>
    ),
    { ...size, ...(fonts ? { fonts } : {}) },
  );
}
