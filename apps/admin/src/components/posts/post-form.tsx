'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Send } from 'lucide-react';
import { toast } from 'sonner';
import { CONTENT_STATUS } from '@inchem/shared';
import { slugify } from '@/lib/utils';
import { Button, LinkButton } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { FormActions } from '@/components/shared/form-actions';
import { ImageUpload } from '@/components/shared/image-upload';
import { RichTextEditor } from './rich-text-editor';
import { createPostAction, updatePostAction, type PostInput } from '@/actions/posts';
import type { Post } from '@/lib/types';

const schema = z.object({
  title: z.string().min(1, 'Nhập tiêu đề').max(250),
  slug: z.string().max(250).optional(),
  excerpt: z.string().max(500).optional(),
  thumbnail: z.string().optional(),
  content: z
    .string()
    .refine((v) => v.replace(/<[^>]*>/g, '').trim().length > 0, 'Nhập nội dung bài viết'),
});

type FormValues = z.infer<typeof schema>;

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const isEdit = Boolean(post);
  const slugTouched = useRef(Boolean(post));

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
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      excerpt: post?.excerpt ?? '',
      thumbnail: post?.thumbnail ?? '',
      content: post?.content ?? '',
    },
  });

  const title = watch('title');

  // Tự sinh slug từ tiêu đề nếu người dùng chưa chỉnh tay.
  useEffect(() => {
    if (!slugTouched.current) setValue('slug', slugify(title));
  }, [title, setValue]);

  // Cảnh báo khi rời trang lúc đang soạn dở (F5 / đóng tab).
  const [saved, setSaved] = useState(false);
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

  const submit = (status: PostInput['status']) =>
    handleSubmit(async (values) => {
      const input: PostInput = { ...values, status };
      const res = isEdit ? await updatePostAction(post!.id, input) : await createPostAction(input);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setSaved(true);
      toast.success(
        status === CONTENT_STATUS.PUBLISHED ? 'Đã xuất bản bài viết' : 'Đã lưu bản nháp',
      );
      router.push('/posts');
    });

  return (
    <form className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody className="space-y-4">
              <Field label="Tiêu đề" htmlFor="title" required error={errors.title?.message}>
                <Input id="title" {...register('title')} placeholder="Tiêu đề bài viết" />
              </Field>

              <Field
                label="Đường dẫn (slug)"
                htmlFor="slug"
                error={errors.slug?.message}
                hint="Tự sinh từ tiêu đề. Có thể chỉnh tay. Bỏ trống để hệ thống tự tạo."
              >
                <Input
                  id="slug"
                  {...register('slug', { onChange: () => (slugTouched.current = true) })}
                  placeholder="tin-tuc-moi"
                />
              </Field>

              <Field
                label="Tóm tắt"
                htmlFor="excerpt"
                error={errors.excerpt?.message}
                hint="Đoạn ngắn hiển thị ở danh sách tin tức."
              >
                <Textarea id="excerpt" {...register('excerpt')} rows={2} />
              </Field>

              <Field label="Nội dung" required error={errors.content?.message}>
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  )}
                />
              </Field>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-2">
              <p className="text-sm font-medium text-fg">Ảnh bìa</p>
              <Controller
                control={control}
                name="thumbnail"
                render={({ field }) => (
                  <ImageUpload value={field.value || undefined} onChange={(url) => field.onChange(url ?? '')} label="Ảnh bìa" />
                )}
              />
            </CardBody>
          </Card>
        </div>
      </div>

      <FormActions>
        <LinkButton href="/posts" variant="ghost" size="sm">
          Huỷ
        </LinkButton>
        <Button type="button" variant="outline" size="sm" loading={isSubmitting} onClick={submit(CONTENT_STATUS.DRAFT)}>
          <Save className="h-4 w-4" /> Lưu nháp
        </Button>
        <Button type="button" size="sm" loading={isSubmitting} onClick={submit(CONTENT_STATUS.PUBLISHED)}>
          <Send className="h-4 w-4" /> Xuất bản
        </Button>
      </FormActions>
    </form>
  );
}
