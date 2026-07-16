import { z } from 'zod';

/** Schema form liên hệ/báo giá — dùng chung cho validate client & server. Khớp CreateLeadDto backend. */
export const leadSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Vui lòng nhập họ tên')
    .max(120, 'Họ tên quá dài'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+().\s-]{8,20}$/, 'Số điện thoại không hợp lệ'),
  email: z
    .union([z.string().trim().email('Email không hợp lệ'), z.literal('')])
    .optional(),
  address: z.string().trim().max(255, 'Địa chỉ quá dài').optional(),
  message: z.string().trim().max(2000, 'Nội dung quá dài').optional(),
  // Honeypot chống bot — người thật để trống.
  website: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
