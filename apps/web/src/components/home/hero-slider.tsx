'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const SLIDES = [
  // Thùng sơn nằm ở đáy ảnh → neo cắt về đáy để không mất chân thùng khi khung thấp.
  { src: '/brand/anh_nen_trang_chu.png', alt: 'Sơn gỗ INCHEM cao cấp', pos: 'right bottom' },
  { src: '/brand/anh_nen_trang_chu_2.png', alt: 'Giải pháp sơn gỗ nội thất INCHEM', pos: 'center' },
  { src: '/brand/anh_nen_trang_chu_3.jpg', alt: 'Hoàn thiện bề mặt gỗ cao cấp INCHEM', pos: 'center' },
];

const INTERVAL = 5000;

/** Nền trang chủ dạng slideshow — 3 ảnh tự trượt từ phải qua trái, lặp vô hạn. */
export function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* Track chứa 3 ảnh nằm ngang, dịch trái theo index để tạo hiệu ứng trượt phải → trái */}
      <div
        className="flex h-full w-full transition-transform duration-1000 ease-in-out"
        style={{
          width: `${SLIDES.length * 100}%`,
          transform: `translateX(-${index * (100 / SLIDES.length)}%)`,
        }}
      >
        {SLIDES.map((slide, i) => (
          <div key={slide.src} className="relative h-full" style={{ width: `${100 / SLIDES.length}%` }}>
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.pos }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
