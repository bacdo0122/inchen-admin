'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { submitLead, type LeadResult } from '@/app/actions/leads';
import { leadSchema, type LeadInput } from '@/lib/schemas';
import { cn } from '@/lib/utils';

const FIELD =
  'h-11 w-full rounded-lg border border-border bg-white px-3.5 text-sm text-fg outline-none transition placeholder:text-muted-fg/70 focus:border-teal focus:ring-2 focus:ring-teal/30';

export function LeadForm() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<LeadResult | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { fullName: '', phone: '', email: '', address: '', message: '', website: '' },
  });

  const onSubmit = (values: LeadInput) => {
    setResult(null);
    startTransition(async () => {
      const res = await submitLead(values);
      setResult(res);
      if (res.ok) reset();
    });
  };

  if (result?.ok) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-card">
        <CheckCircle2 className="size-14 text-teal" aria-hidden />
        <p className="text-lg font-bold text-navy">Đã gửi thành công!</p>
        <p className="text-sm text-muted-fg">{result.message}</p>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="text-sm font-semibold text-indigo hover:underline"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl bg-white p-6 shadow-card sm:p-8"
    >
      <div className="grid gap-4">
        <Field label="Họ và Tên" required error={errors.fullName?.message}>
          <input type="text" autoComplete="name" placeholder="Nguyễn Văn A" className={FIELD} {...register('fullName')} />
        </Field>

        <Field label="Số điện thoại" required error={errors.phone?.message}>
          <input type="tel" autoComplete="tel" placeholder="09xx xxx xxx" className={FIELD} {...register('phone')} />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="email" placeholder="email@example.com" className={FIELD} {...register('email')} />
        </Field>

        <Field label="Địa chỉ" error={errors.address?.message}>
          <input type="text" autoComplete="street-address" placeholder="Địa chỉ của bạn" className={FIELD} {...register('address')} />
        </Field>

        <Field label="Nội Dung" error={errors.message?.message}>
          <textarea
            rows={4}
            placeholder="Sản phẩm bạn quan tâm / nhu cầu cần tư vấn..."
            className={cn(FIELD, 'h-auto resize-y py-2.5')}
            {...register('message')}
          />
        </Field>

        {/* Honeypot ẩn — bot điền sẽ bị backend bỏ qua */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          {...register('website')}
        />

        {result && !result.ok && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{result.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal text-[15px] font-semibold text-teal-fg transition hover:brightness-105 disabled:opacity-70"
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {pending ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
