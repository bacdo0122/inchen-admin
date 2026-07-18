'use client';

import { useState } from 'react';
import { COLOR_TONE_LABEL, type ColorTone } from '@inchem/shared';
import { cn } from '@/lib/utils';
import { ColorCard } from './color-card';
import { EmptyNote } from '@/components/ui/empty-note';
import type { Color } from '@/lib/types';

const TONE_ORDER: ColorTone[] = ['WARM', 'LIGHT', 'DARK', 'COOL'];

/** Bảng màu + lọc theo tông (client). */
export function ColorsExplorer({ colors }: { colors: Color[] }) {
  const [active, setActive] = useState<ColorTone | 'ALL'>('ALL');
  const visible = active === 'ALL' ? colors : colors.filter((c) => c.tone === active);
  const tones = TONE_ORDER.filter((t) => colors.some((c) => c.tone === t));

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        <Chip active={active === 'ALL'} onClick={() => setActive('ALL')}>
          Tất cả
        </Chip>
        {tones.map((t) => (
          <Chip key={t} active={active === t} onClick={() => setActive(t)}>
            {COLOR_TONE_LABEL[t]}
          </Chip>
        ))}
      </div>

      {visible.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((c) => (
            <ColorCard key={c.id} color={c} />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyNote>Chưa có mẫu màu trong tông này.</EmptyNote>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-semibold transition',
        active ? 'bg-brand text-brand-fg' : 'bg-white text-muted-fg shadow-sm hover:text-navy',
      )}
    >
      {children}
    </button>
  );
}
