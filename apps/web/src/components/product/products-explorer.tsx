'use client';

import { useMemo, useState } from 'react';
import { PRODUCT_GROUP_LABEL, type ProductGroup } from '@inchem/shared';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';

/**
 * Phân loại 2 cấp cho trang sản phẩm:
 * - Nhóm cha (parent): Sơn PU, Sơn NC, Sơn UV, Sản phẩm khác
 * - Riêng Sơn PU có 2 type con: trong nhà / ngoài trời (map từ enum PU_INDOOR/PU_OUTDOOR)
 */
type ParentKey = 'PU' | 'NC' | 'UV' | 'OTHER';

const TAXONOMY: { key: ParentKey; label: string; subs: ProductGroup[] }[] = [
  { key: 'PU', label: 'Sơn PU', subs: ['PU_INDOOR', 'PU_OUTDOOR'] },
  { key: 'NC', label: 'Sơn NC', subs: ['NC'] },
  { key: 'UV', label: 'Sơn UV', subs: ['UV'] },
  { key: 'OTHER', label: 'Sản phẩm khác', subs: ['OTHER'] },
];

/** Nhãn ngắn cho type con của PU (dưới heading cha "Sơn PU"). */
const SUB_LABEL: Partial<Record<ProductGroup, string>> = {
  PU_INDOOR: 'Sơn PU Inchem trong nhà',
  PU_OUTDOOR: 'Sơn PU Inchem ngoài trời',
};

/** Lưới sản phẩm nhóm 2 cấp + bộ lọc chip (client). Cards vẫn nằm trong HTML để SEO. */
export function ProductsExplorer({ products }: { products: Product[] }) {
  const [active, setActive] = useState<ParentKey | 'ALL'>('ALL');

  // Dựng cây: parent → subs → items, bỏ những nhánh rỗng.
  const parents = useMemo(() => {
    return TAXONOMY.map((p) => {
      const subs = p.subs
        .map((g) => ({
          group: g,
          label: SUB_LABEL[g] ?? PRODUCT_GROUP_LABEL[g],
          items: products.filter((prod) => prod.group === g),
        }))
        .filter((s) => s.items.length > 0);
      const count = subs.reduce((n, s) => n + s.items.length, 0);
      return { ...p, subs, count };
    }).filter((p) => p.count > 0);
  }, [products]);

  const visible = active === 'ALL' ? parents : parents.filter((p) => p.key === active);

  return (
    <div>
      {/* Chip lọc theo nhóm cha */}
      <div className="flex flex-wrap gap-2">
        <Chip active={active === 'ALL'} onClick={() => setActive('ALL')}>
          Tất cả
        </Chip>
        {parents.map((p) => (
          <Chip key={p.key} active={active === p.key} onClick={() => setActive(p.key)}>
            {p.label}
          </Chip>
        ))}
      </div>

      {/* Nhóm sản phẩm 2 cấp */}
      <div className="mt-8 space-y-14">
        {visible.map((p) => (
          <section key={p.key}>
            <h2 className="mb-6 border-l-4 border-brand pl-3 text-xl font-extrabold text-white">
              {p.label}
            </h2>

            {/* Có nhiều type con (PU) → hiện heading con; chỉ 1 type → hiện thẳng lưới */}
            {p.subs.length > 1 ? (
              <div className="space-y-10">
                {p.subs.map((s) => (
                  <div key={s.group}>
                    <h3 className="mb-4 text-base font-semibold text-brand">{s.label}</h3>
                    <ProductGrid items={s.items} />
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid items={p.subs[0].items} />
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
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
