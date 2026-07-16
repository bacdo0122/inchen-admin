'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button, type ButtonProps } from './button';
import { Modal } from './modal';

interface ConfirmButtonProps {
  /** Nội dung nút kích hoạt (vd icon thùng rác). */
  trigger: React.ReactNode;
  triggerProps?: ButtonProps;
  title: string;
  description?: string;
  confirmLabel?: string;
  /** Chạy khi xác nhận. Trả về { error } để hiện toast lỗi. */
  onConfirm: () => Promise<{ error?: string } | void>;
  successMessage?: string;
}

/**
 * Nút cần xác nhận trước khi thực thi (xoá...). "Khó làm sai" theo nguyên tắc admin.
 */
export function ConfirmButton({
  trigger,
  triggerProps,
  title,
  description,
  confirmLabel = 'Xác nhận',
  onConfirm,
  successMessage,
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      const res = await onConfirm();
      if (res && 'error' in res && res.error) {
        toast.error(res.error);
        return;
      }
      if (successMessage) toast.success(successMessage);
      setOpen(false);
    });
  };

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} {...triggerProps}>
        {trigger}
      </Button>
      <Modal open={open} onClose={() => !pending && setOpen(false)} title={title} className="max-w-md">
        {description && <p className="text-sm text-muted-fg">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Huỷ
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={pending}>
            {confirmLabel}
          </Button>
        </div>
      </Modal>
    </>
  );
}
