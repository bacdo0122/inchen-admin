'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { COLOR_TONE, COLOR_TONE_LABEL } from '@inchem/shared';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Field } from '@/components/ui/field';
import { Input, Select } from '@/components/ui/input';
import { ImageUpload } from '@/components/shared/image-upload';
import { createColorAction, updateColorAction, type ColorInput } from '@/actions/colors';
import type { Color } from '@/lib/types';

const schema = z.object({
  code: z.string().min(1, 'Nhập mã màu').max(50),
  tone: z.nativeEnum(COLOR_TONE),
  hex: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Mã hex không hợp lệ')
    .optional()
    .or(z.literal('')),
  image: z.string().optional(),
  order: z.coerce.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ColorFormModal({
  color,
  trigger,
  triggerProps,
}: {
  color?: Color;
  trigger: React.ReactNode;
  triggerProps?: ButtonProps;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(color);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: color?.code ?? '',
      tone: color?.tone ?? COLOR_TONE.WARM,
      hex: color?.hex ?? '',
      image: color?.image ?? '',
      order: color?.order ?? 0,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const input: ColorInput = {
      code: values.code,
      tone: values.tone,
      hex: values.hex || undefined,
      image: values.image || undefined,
      order: values.order ?? 0,
    };
    const res = isEdit ? await updateColorAction(color!.id, input) : await createColorAction(input);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(isEdit ? 'Đã cập nhật màu' : 'Đã thêm màu');
    setOpen(false);
    if (!isEdit) reset();
  });

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} {...triggerProps}>
        {trigger}
      </Button>
      <Modal
        open={open}
        onClose={() => !isSubmitting && setOpen(false)}
        title={isEdit ? 'Sửa màu' : 'Thêm màu'}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Mã màu" htmlFor="code" required error={errors.code?.message}>
            <Input id="code" {...register('code')} placeholder="SW 6814" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tông màu" htmlFor="tone" required error={errors.tone?.message}>
              <Select id="tone" {...register('tone')}>
                {Object.values(COLOR_TONE).map((t) => (
                  <option key={t} value={t}>
                    {COLOR_TONE_LABEL[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Thứ tự" htmlFor="order" error={errors.order?.message}>
              <Input id="order" type="number" min={0} {...register('order')} />
            </Field>
          </div>

          <Field label="Mã hex" htmlFor="hex" hint="Dùng khi không có ảnh mẫu." error={errors.hex?.message}>
            <div className="flex items-center gap-2">
              <Input id="hex" {...register('hex')} placeholder="#3E6E8E" className="font-mono" />
              <Controller
                control={control}
                name="hex"
                render={({ field }) => (
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(field.value ?? '') ? field.value : '#cccccc'}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border"
                    aria-label="Chọn màu"
                  />
                )}
              />
            </div>
          </Field>

          <div>
            <p className="mb-1.5 text-sm font-medium text-fg">Ảnh mẫu màu</p>
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageUpload value={field.value || undefined} onChange={(url) => field.onChange(url ?? '')} aspect="aspect-video" />
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Huỷ
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEdit ? 'Lưu' : 'Thêm màu'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
