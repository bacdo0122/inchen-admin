import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { ProductForm } from '@/components/products/product-form';

export const metadata = { title: 'Thêm sản phẩm' };

export default function NewProductPage() {
  return (
    <>
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Danh sách sản phẩm
      </Link>
      <PageHeader title="Thêm sản phẩm" description="Thêm một dòng sơn mới." />
      <ProductForm />
    </>
  );
}
