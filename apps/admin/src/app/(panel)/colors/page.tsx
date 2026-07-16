import Image from 'next/image';
import { Palette, Pencil, Plus } from 'lucide-react';
import { COLOR_TONE_LABEL } from '@inchem/shared';
import { apiFetch } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SelectFilter } from '@/components/shared/table-filters';
import { ColorFormModal } from '@/components/colors/color-form-modal';
import { DeleteColorButton } from '@/components/colors/delete-color-button';
import type { Color } from '@/lib/types';

export const metadata = { title: 'Bảng màu' };

const toneOptions = Object.entries(COLOR_TONE_LABEL).map(([value, label]) => ({ value, label }));

export default async function ColorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tone?: string }>;
}) {
  const { tone } = await searchParams;
  const sp = new URLSearchParams();
  if (tone) sp.set('tone', tone);
  const colors = await apiFetch<Color[]>(`/colors${sp.toString() ? `?${sp}` : ''}`);

  return (
    <>
      <PageHeader
        title="Bảng màu"
        description={`${colors.length} mẫu màu`}
        action={
          <ColorFormModal
            trigger={
              <>
                <Plus className="h-4 w-4" /> Thêm màu
              </>
            }
            triggerProps={{ size: 'sm' }}
          />
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SelectFilter paramKey="tone" options={toneOptions} allLabel="Tất cả tông màu" />
      </div>

      {colors.length === 0 ? (
        <EmptyState
          icon={Palette}
          title={tone ? 'Không có màu ở tông này' : 'Chưa có mẫu màu nào'}
          description="Thêm mẫu màu để hiển thị trong bảng màu trên website."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {colors.map((color) => (
            <Card key={color.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted" style={color.hex && !color.image ? { backgroundColor: color.hex } : undefined}>
                {color.image && <Image src={color.image} alt={color.name} fill className="object-cover" sizes="200px" unoptimized />}
              </div>
              <div className="space-y-1.5 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-fg" title={color.name}>
                    {color.name}
                  </p>
                  <Badge tone="neutral">{COLOR_TONE_LABEL[color.tone]}</Badge>
                </div>
                <p className="font-mono text-xs text-muted-fg">{color.code}</p>
                <div className="flex items-center justify-end gap-1 pt-1">
                  <ColorFormModal
                    color={color}
                    trigger={<Pencil className="h-4 w-4" />}
                    triggerProps={{ variant: 'ghost', size: 'icon', 'aria-label': 'Sửa' }}
                  />
                  <DeleteColorButton id={color.id} name={color.name} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
