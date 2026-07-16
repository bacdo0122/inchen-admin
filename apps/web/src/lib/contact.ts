/** Helper dựng link liên hệ — dùng được cả client lẫn server (không phụ thuộc env). */

/** Bỏ dấu chấm/khoảng trắng trong số điện thoại để dùng cho tel:/zalo. */
export function normalizePhone(phone: string): string {
  return phone.replace(/[.\s]/g, '');
}

export function telHref(phone: string): string {
  return `tel:${normalizePhone(phone)}`;
}

export function zaloHref(phone: string): string {
  return `https://zalo.me/${normalizePhone(phone)}`;
}
