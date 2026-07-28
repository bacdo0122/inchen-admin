'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Ảnh đang xem lớn. */
interface LightboxImage {
  src: string;
  alt: string;
}

/** Tâm của ảnh gốc trên viewport — để ảnh "bung ra" từ đúng thumbnail vừa bấm. */
interface Origin {
  x: number;
  y: number;
}

const MIN_SCALE = 1;
const MAX_SCALE = 6;
/** Mức zoom khi bấm đôi vào ảnh. */
const DOUBLE_CLICK_SCALE = 2.5;
/** Thời gian animation đóng — phải khớp với keyframes trong tailwind.config.ts. */
const CLOSE_DURATION = 200;

interface LightboxApi {
  /** Mở ảnh lớn. `origin` là tâm thumbnail vừa bấm, dùng cho animation bung ra. */
  open: (image: LightboxImage, origin?: Origin) => void;
}

const LightboxContext = createContext<LightboxApi | null>(null);

/**
 * Provider cho tính năng xem ảnh lớn — đặt một lần ở root layout.
 * Overlay render qua portal vào body nên không bị overflow/z-index của card cắt mất.
 */
export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ image: LightboxImage; origin?: Origin } | null>(null);

  const open = useCallback((image: LightboxImage, origin?: Origin) => {
    if (!image.src) return;
    setState({ image, origin });
  }, []);

  const api = useMemo<LightboxApi>(() => ({ open }), [open]);

  return (
    <LightboxContext.Provider value={api}>
      {children}
      {state && (
        <LightboxOverlay
          image={state.image}
          origin={state.origin}
          onClose={() => setState(null)}
        />
      )}
    </LightboxContext.Provider>
  );
}

export function useLightbox(): LightboxApi {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error('useLightbox phải dùng bên trong <LightboxProvider>.');
  return ctx;
}

/**
 * Ảnh bấm được để xem lớn: bọc <Image> trong <button>, hover chỉ đổi con trỏ
 * thành kính lúp (cursor-zoom-in), không có lớp phủ hay chữ.
 * Dùng được từ server component (chỉ nhận props serializable).
 */
export function ZoomableImage({
  src,
  alt,
  sizes,
  priority,
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}) {
  const { open } = useLightbox();

  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        open({ src, alt }, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={`Xem ảnh lớn: ${alt}`}
      className={cn(
        'absolute inset-0 block cursor-zoom-in overflow-hidden',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover', imageClassName)}
      />
    </button>
  );
}

function clampScale(value: number) {
  return Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);
}

/**
 * Overlay xem ảnh lớn: mask tối + đúng ảnh vừa bấm, không có thanh công cụ.
 * Zoom bằng con lăn / pinch / bấm đôi, kéo để di chuyển khi đã zoom.
 * Đóng bằng Esc, nút X hoặc bấm ra vùng tối.
 */
function LightboxOverlay({
  image,
  origin,
  onClose,
}: {
  image: LightboxImage;
  origin?: Origin;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Các pointer đang giữ trên ảnh — 1 pointer = kéo, 2 pointer = pinch. */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Đóng có animation thu ảnh về chỗ thumbnail rồi mới unmount. */
  const requestClose = useCallback(() => {
    setClosing(true);
    closeTimer.current = setTimeout(onClose, CLOSE_DURATION);
  }, [onClose]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  /** Giới hạn kéo: ảnh không được rời khỏi vùng nhìn quá nửa mỗi chiều. */
  const clampOffset = useCallback((next: { x: number; y: number }, atScale: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return next;
    const maxX = ((atScale - 1) * rect.width) / 2;
    const maxY = ((atScale - 1) * rect.height) / 2;
    return {
      x: Math.min(Math.max(next.x, -maxX), maxX),
      y: Math.min(Math.max(next.y, -maxY), maxY),
    };
  }, []);

  const applyScale = useCallback(
    (next: number) => {
      const value = clampScale(next);
      setScale(value);
      setOffset((prev) => (value === 1 ? { x: 0, y: 0 } : clampOffset(prev, value)));
    },
    [clampOffset],
  );

  // Khoá scroll trang khi overlay mở + trả focus về nút đã bấm khi đóng.
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      trigger?.focus?.();
    };
  }, []);

  // Bàn phím: Esc đóng, +/- zoom.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          requestClose();
          break;
        case '+':
        case '=':
          applyScale(scale * 1.5);
          break;
        case '-':
        case '_':
          applyScale(scale / 1.5);
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [applyScale, requestClose, scale]);

  // Wheel/trackpad zoom — React gắn onWheel dạng passive nên phải tự addEventListener.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      applyScale(scale * (e.deltaY > 0 ? 1 / 1.1 : 1.1));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [applyScale, scale]);

  const pointerDistance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setDragging(true);
    if (pointers.current.size === 2) pinch.current = { distance: pointerDistance(), scale };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Pinch 2 ngón → zoom theo tỉ lệ khoảng cách.
    if (pointers.current.size === 2 && pinch.current) {
      applyScale(pinch.current.scale * (pointerDistance() / (pinch.current.distance || 1)));
      return;
    }
    // 1 ngón + đang zoom → kéo di chuyển ảnh.
    if (pointers.current.size === 1 && scale > 1) {
      setOffset((o) =>
        clampOffset({ x: o.x + (e.clientX - prev.x), y: o.y + (e.clientY - prev.y) }, scale),
      );
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) setDragging(false);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ảnh: ${image.alt}`}
      className="fixed inset-0 z-[1000]"
    >
      {/* Mask tối phía sau */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 motion-reduce:animate-none',
          closing ? 'animate-fade-out' : 'animate-fade-in',
        )}
      />

      {/* Vùng ảnh — bấm ra ngoài ảnh để đóng */}
      <div
        ref={stageRef}
        className="absolute inset-0 touch-none overflow-hidden"
        onClick={requestClose}
      >
        <div
          className={cn(
            'flex h-full w-full items-center justify-center p-4 sm:p-8 motion-reduce:animate-none',
            closing ? 'animate-preview-out' : 'animate-preview-in',
          )}
          style={{ transformOrigin: origin ? `${origin.x}px ${origin.y}px` : 'center' }}
        >
          {/* width/height=0 + sizes: để CSS quyết định kích thước, ảnh tự co vừa khung */}
          <Image
            src={image.src}
            alt={image.alt}
            width={0}
            height={0}
            sizes="100vw"
            quality={90}
            priority
            draggable={false}
            style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})` }}
            className={cn(
              'h-auto w-auto max-h-full max-w-full select-none object-contain',
              !dragging && 'transition-transform duration-200 ease-out',
              scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in',
            )}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={() => applyScale(scale > 1 ? MIN_SCALE : DOUBLE_CLICK_SCALE)}
          />
        </div>
      </div>

      {/* Nút đóng — cách duy nhất để thoát trên mobile ngoài việc bấm vùng tối */}
      <button
        ref={closeRef}
        type="button"
        onClick={requestClose}
        aria-label="Đóng"
        title="Đóng"
        className="absolute right-3 top-3 rounded-full bg-black/45 p-2.5 text-white/90 backdrop-blur-sm transition hover:bg-black/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:right-6 sm:top-6"
      >
        <X className="size-5" />
      </button>
    </div>,
    document.body,
  );
}
