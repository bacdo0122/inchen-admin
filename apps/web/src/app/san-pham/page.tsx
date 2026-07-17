import type { Metadata } from 'next';
import { getProducts } from '@/lib/data';
import { Container } from '@/components/ui/container';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Accent } from '@/components/ui/section-heading';
import { ProductsExplorer } from '@/components/product/products-explorer';
import { EmptyNote } from '@/components/ui/empty-note';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Sản phẩm sơn gỗ INCHEM',
  description:
    'Danh mục sơn gỗ INCHEM: sơn PU trong nhà, PU ngoài trời, sơn NC, sơn UV và sản phẩm khác. Chính hãng Sherwin-Williams, tư vấn kỹ thuật miễn phí.',
  alternates: { canonical: '/san-pham' },
};

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    products = await getProducts();
  } catch {
    products = [];
  }

  return (
    <section className="min-h-[60vh] bg-navy py-12 lg:py-16">
      <Container>
        <Breadcrumb items={[{ label: 'SẢN PHẨM' }]} tone="dark" />
        <h1 className="mt-5 text-3xl font-extrabold text-white sm:text-4xl">
          Sơn <Accent>Pu InChem</Accent> Cao Cấp
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-navy-fg/70">
          Hệ sơn gỗ cao cấp chính hãng — chọn nhóm để xem sản phẩm phù hợp.
        </p>

        <div className="mt-8">
          {products.length > 0 ? (
            <ProductsExplorer products={products} />
          ) : (
            <EmptyNote tone="dark">Đang cập nhật sản phẩm. Vui lòng quay lại sau.</EmptyNote>
          )}
        </div>
      </Container>
    </section>
  );
}
