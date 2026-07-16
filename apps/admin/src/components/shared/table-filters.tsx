'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input, Select } from '@/components/ui/input';

/** Cập nhật 1 tham số URL, luôn reset page về 1, giữ nguyên các filter khác. */
function useSetParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (value) sp.set(key, value);
      else sp.delete(key);
      sp.delete('page');
      router.replace(`${pathname}?${sp.toString()}`);
    },
    [router, pathname, searchParams],
  );
}

export function SearchInput({
  paramKey = 'search',
  placeholder = 'Tìm kiếm…',
}: {
  paramKey?: string;
  placeholder?: string;
}) {
  const searchParams = useSearchParams();
  const setParam = useSetParam();
  const [value, setValue] = useState(searchParams.get(paramKey) ?? '');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Đồng bộ khi điều hướng đổi URL từ bên ngoài.
  useEffect(() => {
    setValue(searchParams.get(paramKey) ?? '');
  }, [searchParams, paramKey]);

  const onChange = (v: string) => {
    setValue(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setParam(paramKey, v.trim()), 350);
  };

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}

export function SelectFilter({
  paramKey,
  options,
  allLabel = 'Tất cả',
}: {
  paramKey: string;
  options: { value: string; label: string }[];
  allLabel?: string;
}) {
  const searchParams = useSearchParams();
  const setParam = useSetParam();
  const current = searchParams.get(paramKey) ?? '';

  return (
    <Select
      value={current}
      onChange={(e) => setParam(paramKey, e.target.value)}
      className="w-full sm:w-48"
      aria-label={allLabel}
    >
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
