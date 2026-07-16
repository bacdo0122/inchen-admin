'use server';

import { apiPost } from '@/lib/api';
import { leadSchema, type LeadInput } from '@/lib/schemas';

export type LeadResult = { ok: boolean; message: string };

/**
 * Server action gửi form liên hệ → backend POST /leads.
 * Chạy phía server nên không lộ API URL, không vướng CORS.
 * Backend tự lưu DB trước rồi mới thông báo → không mất lead.
 */
export async function submitLead(input: LeadInput): Promise<LeadResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: 'Thông tin chưa hợp lệ, vui lòng kiểm tra lại.' };
  }

  // Bỏ email rỗng để không rớt validate @IsEmail phía backend.
  const { email, ...rest } = parsed.data;
  const payload = { ...rest, ...(email ? { email } : {}) };

  try {
    await apiPost('/leads', payload);
    return {
      ok: true,
      message: 'Cảm ơn bạn! Chúng tôi đã nhận thông tin và sẽ liên hệ trong thời gian sớm nhất.',
    };
  } catch {
    return {
      ok: false,
      message: 'Gửi yêu cầu thất bại. Vui lòng gọi hotline 093.642.8226 để được hỗ trợ ngay.',
    };
  }
}
