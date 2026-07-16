'use client';

import { useActionState } from 'react';
import { AlertCircle } from 'lucide-react';
import { loginAction, type LoginState } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';

export function LoginForm({ next, expired }: { next?: string; expired?: boolean }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      {expired && !state.error && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
        </p>
      )}

      {state.error && (
        <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}

      <Field label="Email" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="admin@inchemminhhien.com.vn"
          required
          autoFocus
        />
      </Field>

      <Field label="Mật khẩu" htmlFor="password" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </Field>

      <Button type="submit" className="w-full" loading={pending}>
        Đăng nhập
      </Button>
    </form>
  );
}
