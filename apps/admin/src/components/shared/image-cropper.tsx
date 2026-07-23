'use client';

import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Cạnh dài tối đa của ảnh sau khi cắt (px). Cắt xong luôn co ảnh về mức này để
 * file nhẹ, đồng thời web hiển thị trong khung tỉ lệ cố định nên không cần lớn hơn.
 */
const MAX_LONG_EDGE = 1600;
/** Chất lượng nén WebP đầu ra. */
const OUTPUT_QUALITY = 0.85;

/** Nạp ảnh từ data URL thành HTMLImageElement (đợi decode xong). */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không đọc được ảnh'));
    img.src = src;
  });
}

/**
 * Vẽ vùng đã chọn (theo pixel gốc) ra canvas, co về cạnh dài tối đa và xuất WebP.
 * Trả về File để upload thẳng qua luồng sẵn có.
 */
async function cropToFile(src: string, area: Area): Promise<File> {
  const image = await loadImage(src);
  const longEdge = Math.max(area.width, area.height);
  const scale = Math.min(1, MAX_LONG_EDGE / longEdge);
  const outW = Math.max(1, Math.round(area.width * scale));
  const outH = Math.max(1, Math.round(area.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Trình duyệt không hỗ trợ canvas');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, outW, outH);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', OUTPUT_QUALITY),
  );
  if (!blob) throw new Error('Cắt ảnh thất bại');
  return new File([blob], `crop-${Date.now()}.webp`, { type: 'image/webp' });
}

/**
 * Modal cắt ảnh theo tỉ lệ cố định (pan + zoom). Dùng chung cho mọi ô upload ảnh
 * để ảnh lưu lên R2 luôn đúng khung → hiển thị đẹp cả desktop lẫn mobile.
 */
export function ImageCropperModal({
  src,
  aspect,
  onCancel,
  onCropped,
}: {
  /** Data URL của ảnh vừa chọn (ảnh cục bộ, không dính CORS). */
  src: string;
  /** Tỉ lệ khung cắt = rộng / cao (vd 4/3, 16/9, 3/4). */
  aspect: number;
  onCancel: () => void;
  onCropped: (file: File) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setArea(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!area) return;
    setProcessing(true);
    try {
      const file = await cropToFile(src, area);
      onCropped(file);
    } catch {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold text-fg">Cắt ảnh</h2>
          <span className="text-xs text-muted-fg">Kéo để chỉnh khung · cuộn/thanh trượt để phóng to</span>
        </div>

        <div className="relative h-[55vh] w-full bg-neutral-900">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
            restrictPosition
          />
        </div>

        <div className="flex items-center gap-3 border-t px-4 py-3">
          <ZoomIn className="h-4 w-4 shrink-0 text-muted-fg" aria-hidden />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer accent-brand"
            aria-label="Phóng to ảnh"
          />
        </div>

        <div className="flex justify-end gap-2 border-t bg-muted/30 px-4 py-3">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={processing}>
            Huỷ
          </Button>
          <Button type="button" size="sm" onClick={handleConfirm} disabled={!area} loading={processing}>
            Cắt &amp; dùng ảnh
          </Button>
        </div>
      </div>
    </div>
  );
}
