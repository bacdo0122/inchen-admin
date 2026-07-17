import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { ProductForm } from '@/components/products/product-form';
import { DeleteProductButton } from '@/components/products/delete-product-button';
import type { Product } from '@/lib/types';

export const metadata = { title: 'Sửa sản phẩm' };

async function getProduct(id: string): Promise<Product> {
  try {
    return await apiFetch<Product>(`/products/admin/${id}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <>
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-fg">
        <ArrowLeft className="h-4 w-4" /> Danh sách sản phẩm
      </Link>
      <PageHeader
        title="Sửa sản phẩm"
        description={`/${product.slug}`}
        action={<DeleteProductButton id={product.id} name={product.name} redirectTo="/products" />}
      />
      <ProductForm product={product} />
    </>
  );
}
