'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { CONTENT_STATUS, PRODUCT_GROUP, PRODUCT_GROUP_LABEL } from '@inchem/shared';
import { slugify } from '@/lib/utils';
import { Button, LinkButton } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input, Select, Textarea } from '@/components/ui/input';
import { FormActions } from '@/components/shared/form-actions';
import { ImageUpload } from '@/components/shared/image-upload';
import { createProductAction, updateProductAction, type ProductInput } from '@/actions/products';
import type { Product } from '@/lib/types';

const schema = z.object({
  name: z.string().min(1, 'Nhập tên sản phẩm').max(200),
  slug: z.string().max(200).optional(),
  group: z.nativeEnum(PRODUCT_GROUP, { required_error: 'Chọn nhóm' }),
  gloss: z.string().max(50).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  order: z.coerce.number().int().min(0).optional(),
  visible: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const slugTouched = useRef(Boolean(product));
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      group: product?.group ?? PRODUCT_GROUP.PU_INDOOR,
      gloss: product?.gloss ?? '',
      description: product?.description ?? '',
      image: product?.image ?? '',
      order: product?.order ?? 0,
      visible: product ? product.status === CONTENT_STATUS.PUBLISHED : true,
    },
  });

  const name = watch('name');
  useEffect(() => {
    if (!slugTouched.current) setValue('slug', slugify(name));
  }, [name, setValue]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty && !saved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty, saved]);

  const onSubmit = handleSubmit(async (values) => {
    const input: ProductInput = {
      name: values.name,
      slug: values.slug,
      group: values.group,
      gloss: values.gloss,
      description: values.description,
      image: values.image,
      order: values.order ?? 0,
      status: values.visible ? CONTENT_STATUS.PUBLISHED : CONTENT_STATUS.DRAFT,
    };
    const res = isEdit
      ? await updateProductAction(product!.id, input)
      : await createProductAction(input);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setSaved(true);
    toast.success(isEdit ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm');
    router.push('/products');
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody className="space-y-4">
              <Field label="Tên sản phẩm" htmlFor="name" required error={errors.name?.message}>
                <Input id="name" {...register('name')} placeholder="VD: Sơn PU bóng INCHEM" />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nhóm sản phẩm" htmlFor="group" required error={errors.group?.message}>
                  <Select id="group" {...register('group')}>
                    {Object.values(PRODUCT_GROUP).map((g) => (
                      <option key={g} value={g}>
                        {PRODUCT_GROUP_LABEL[g]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Độ bóng" htmlFor="gloss" hint='VD: "10%", "30/90%"' error={errors.gloss?.message}>
                  <Input id="gloss" {...register('gloss')} placeholder="10%" />
                </Field>
              </div>

              <Field
                label="Đường dẫn (slug)"
                htmlFor="slug"
                hint="Tự sinh từ tên. Có thể chỉnh tay."
                error={errors.slug?.message}
              >
                <Input
                  id="slug"
                  {...register('slug', { onChange: () => (slugTouched.current = true) })}
                  placeholder="son-pu-bong-inchem"
                />
              </Field>

              <Field label="Mô tả" htmlFor="description" error={errors.description?.message}>
                <Textarea id="description" {...register('description')} rows={5} placeholder="Đặc điểm, ứng dụng, hướng dẫn…" />
              </Field>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-2">
              <p className="text-sm font-medium text-fg">Ảnh sản phẩm</p>
              <Controller
                control={control}
                name="image"
                render={({ field }) => (
                  <ImageUpload value={field.value || undefined} onChange={(url) => field.onChange(url ?? '')} aspect="aspect-[4/3]" aspectRatio={4 / 3} />
                )}
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" {...register('visible')} className="h-4 w-4 rounded border-border text-brand focus:ring-brand" />
                <span className="text-sm font-medium text-fg">Hiển thị trên website</span>
              </label>
              <Field label="Thứ tự sắp xếp" htmlFor="order" hint="Số nhỏ hiển thị trước." error={errors.order?.message}>
                <Input id="order" type="number" min={0} {...register('order')} className="w-28" />
              </Field>
            </CardBody>
          </Card>
        </div>
      </div>

      <FormActions>
        <LinkButton href="/products" variant="ghost" size="sm">
          Huỷ
        </LinkButton>
        <Button type="submit" size="sm" loading={isSubmitting}>
          <Save className="h-4 w-4" /> Lưu sản phẩm
        </Button>
      </FormActions>
    </form>
  );
}
