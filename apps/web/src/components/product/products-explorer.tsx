'use client';

import { useMemo, useState } from 'react';
import { PRODUCT_GROUP_LABEL, type ProductGroup } from '@inchem/shared';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';

/** Thứ tự nhóm hiển thị theo Figma. */
const GROUP_ORDER: ProductGroup[] = ['PU_INDOOR', 'PU_OUTDOOR', 'NC', 'UV', 'OTHER'];

/** Lưới sản phẩm nhóm theo hệ sơn + bộ lọc chip (client). Cards vẫn nằm trong HTML để SEO. */
export function ProductsExplorer({ products }: { products: Product[] }) {
  const [active, setActive] = useState<ProductGroup | 'ALL'>('ALL');

  const groups = useMemo(() => {
    return GROUP_ORDER.map((g) => ({
      group: g,
      label: PRODUCT_GROUP_LABEL[g],
      items: products.filter((p) => p.group === g),
    })).filter((s) => s.items.length > 0);
  }, [products]);

  const visible = active === 'ALL' ? groups : groups.filter((s) => s.group === active);

  return (
    <div>
      {/* Chip lọc */}
      <div className="flex flex-wrap gap-2">
        <Chip active={active === 'ALL'} onClick={() => setActive('ALL')}>
          Tất cả
        </Chip>
        {groups.map((s) => (
          <Chip key={s.group} active={active === s.group} onClick={() => setActive(s.group)}>
            {s.label}
          </Chip>
        ))}
      </div>

      {/* Nhóm sản phẩm */}
      <div className="mt-8 space-y-12">
        {visible.map((s) => (
          <section key={s.group}>
            <h2 className="mb-5 text-lg font-bold text-white">{s.label}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {s.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ))}
      </div>
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
        active ? 'bg-brand text-brand-fg' : 'bg-white/10 text-navy-fg/80 hover:bg-white/20',
      )}
    >
      {children}
    </button>
  );
}
