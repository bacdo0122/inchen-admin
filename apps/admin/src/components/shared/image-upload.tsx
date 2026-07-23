'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { UploadResult } from '@/lib/types';
import { ImageCropperModal } from './image-cropper';

/**
 * Upload 1 ảnh qua proxy /api/upload → trả URL trên Cloudflare R2.
 * Có preview, báo tiến trình (đang tải), và nút gỡ ảnh.
 *
 * Nếu truyền `aspectRatio` (rộng/cao), ảnh vừa chọn sẽ đi qua bước cắt (crop)
 * theo đúng tỉ lệ trước khi upload → mọi ảnh lưu lên R2 đều đúng khung, hiển thị
 * đẹp đồng nhất trên cả desktop lẫn mobile.
 */
export function ImageUpload({
  value,
  onChange,
  label = 'Ảnh',
  aspect = 'aspect-video',
  aspectRatio,
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  label?: string;
  aspect?: string;
  /** Bật crop theo tỉ lệ cố định = rộng / cao (vd 4/3, 16/9, 3/4). Bỏ trống = upload thẳng. */
  aspectRatio?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  /** Đọc file cục bộ thành data URL để nạp vào trình cắt (không dính CORS). */
  const openCropper = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setCropSrc(String(reader.result));
    reader.onerror = () => toast.error('Không đọc được tệp ảnh');
    reader.readAsDataURL(file);
  };

  /** Chọn/đổi ảnh: có tỉ lệ thì mở cropper, không thì upload thẳng. */
  const handlePick = (file: File) => {
    if (aspectRatio) openCropper(file);
    else void handleFile(file);
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = (await res.json()) as UploadResult | { message?: string };
      if (!res.ok || !('url' in data)) {
        throw new Error(('message' in data && data.message) || 'Upload thất bại');
      }
      onChange(data.url);
      toast.success('Đã tải ảnh lên');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload thất bại');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePick(file);
          // Reset ngay để chọn lại cùng 1 tệp vẫn kích hoạt onChange.
          if (inputRef.current) inputRef.current.value = '';
        }}
      />

      {cropSrc && aspectRatio && (
        <ImageCropperModal
          src={cropSrc}
          aspect={aspectRatio}
          onCancel={() => setCropSrc(null)}
          onCropped={(file) => {
            setCropSrc(null);
            void handleFile(file);
          }}
        />
      )}

      {value ? (
        <div className={cn('relative overflow-hidden rounded-lg border bg-muted', aspect)}>
          <Image src={value} alt={label} fill className="object-cover" sizes="400px" unoptimized />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white hover:bg-black/75"
            >
              Đổi ảnh
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              disabled={uploading}
              className="rounded-md bg-black/60 p-1.5 text-white hover:bg-red-600"
              aria-label="Gỡ ảnh"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/40 text-muted-fg transition-colors hover:border-brand hover:text-brand',
            aspect,
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-sm font-medium">Chọn ảnh để tải lên</span>
              <span className="text-xs">JPG, PNG, WebP · tối đa 5MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
