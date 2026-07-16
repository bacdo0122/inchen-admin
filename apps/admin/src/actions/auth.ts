'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { env } from '@/lib/env';
import { clearSession, setSession } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export interface LoginState {
  error?: string;
}

/** Đăng nhập: gọi backend, lưu JWT vào cookie httpOnly, chuyển vào trang tổng quan. */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' };
  }

  let token: string;
  try {
    const res = await fetch(`${env.apiBaseUrl}/auth/login`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    if (res.status === 401) {
      return { error: 'Email hoặc mật khẩu không đúng' };
    }
    if (!res.ok) {
      return { error: `Không đăng nhập được (lỗi ${res.status})` };
    }
    const data = (await res.json()) as { accessToken: string };
    token = data.accessToken;
  } catch {
    return { error: 'Không kết nối được máy chủ. Vui lòng thử lại.' };
  }

  await setSession(token);

  // Quay lại trang người dùng định vào (chỉ chấp nhận path nội bộ, chống open-redirect).
  const next = formData.get('next');
  const target = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';
  redirect(target);
}

/** Đăng xuất. */
export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect('/login');
}
