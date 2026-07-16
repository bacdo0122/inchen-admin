import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold text-navy">Không tìm thấy trang</h1>
      <p className="mt-2 max-w-md text-sm text-muted-fg">
        Trang bạn tìm không tồn tại hoặc đã được di chuyển. Vui lòng quay về trang chủ.
      </p>
      <div className="mt-8">
        <ButtonLink href="/" variant="cta" withChevron>
          Về trang chủ
        </ButtonLink>
      </div>
    </Container>
  );
}
