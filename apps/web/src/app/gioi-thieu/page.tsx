import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { BadgePill } from "@/components/ui/badge-pill";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Minh Hiền - Inchem: hơn 25 năm kinh nghiệm sơn gỗ nội thất.",
  alternates: { canonical: "/gioi-thieu" },
};

export default function AboutPage() {
  return (
    <>
      {/* Banner thương hiệu — ảnh nền full-width */}
      <section className="relative w-full overflow-hidden bg-navy">
        <div className="relative aspect-[3/2] w-full">
          <Image
            src="/brand/anh_nen_gioi_thieu.jpg"
            alt="Lễ kỷ niệm Sherwin-Williams"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </section>

      <Container className="py-12 lg:py-16">
        <Breadcrumb items={[{ label: "GIỚI THIỆU" }]} />

        <div className="mt-8 text-center">
          <h1 className="text-3xl font-extrabold text-navy sm:text-4xl">
            Giới Thiệu
          </h1>
        </div>

        {/* Lịch sử Sherwin-Williams */}
        <div className="mx-auto mt-8 max-w-3xl space-y-4 text-[15px] leading-relaxed text-fg">
          <p>
            Được sáng lập bởi ông Henry Sherwin và ông Edward Williams vào năm
            1866, Công ty Sherwin-Williams là một công ty hàng đầu quốc tế trong
            việc sản xuất, phát triển, phân phối và cung cấp sơn phủ và các sản
            phẩm liên quan cho các công ty chuyên sản xuất đồ gỗ, các ngành công
            nghiệp sản xuất, thương mại và các nhà máy sản xuất. Công ty
            Sherwin-Williams phân phối sản phẩm rộng khắp hơn 50 nước trên thế
            giới.
          </p>
        </div>

        {/* Video + hình ảnh */}
        <div className="mx-auto mt-10 grid max-w-3xl items-stretch gap-4 sm:grid-cols-[2.16fr_1fr]">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy">
            <iframe
              src="https://www.youtube-nocookie.com/embed/YJnl6vjW_1g"
              title="Sherwin-Williams — Color of the Year"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted sm:aspect-auto">
            <Image
              src="/brand/anh_building_gioi_thieu.jpg"
              alt="Trụ sở Sherwin-Williams"
              fill
              sizes="(max-width: 640px) 100vw, 260px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Inchem */}
        <div className="mx-auto mt-10 max-w-3xl space-y-4 text-[15px] leading-relaxed text-fg">
          <p>
            Inchem, một trong những Công ty chuyên nghiệp cung cấp sơn ở khu vực
            châu Á, gia nhập Sherwin-Williams năm 2007. Sự sáp nhập kỹ nghệ sơn
            gỗ và đội ngũ phục vụ chuyên nghiệp đã hỗ trợ cho các nhà sản xuất
            theo hợp đồng và các khách hàng nội địa bằng các loại sản phẩm tốt ở
            Việt Nam. Sherwin-Williams (INCHEM) đã có 4 nhà máy, 3 trung tâm
            Nghiên cứu &amp; Phát triển.
          </p>
          <p>
            Kế thừa nền tảng công nghệ và tiêu chuẩn chất lượng của
            Sherwin-Williams, INCHEM phát triển các dòng sơn gỗ chuyên dụng như
            PU, NC, UV, sơn gốc nước, sơn màu và sơn phủ, đáp ứng yêu cầu về độ
            bền, tính thẩm mỹ và hiệu quả sản xuất cho ngành nội thất hiện đại.
          </p>
        </div>

        <div className="mt-14">
          <BadgePill>Công Ty TNHH DV TM & SX Minh Hiền</BadgePill>
          <h2 className="mt-4 text-xl font-bold text-navy sm:text-2xl">
            Công Ty TNHH DV TM &amp; SX Minh Hiền — Nhà Phân Phối Sơn
            Sherwin-Williams “Inchem” Tại Khu Vực Phía Bắc Việt Nam
          </h2>

          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_1.4fr]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted shadow-card">
              <Image
                src="/brand/anh_thong_tin_mh.png"
                alt="Minh Hiền - Inchem"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-contain"
              />
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-fg">
              <p>
                Với bề dầy hơn 25 năm kinh nghiệm trong lĩnh vực phân phối sơn
                gỗ nội thất . Cùng với đội ngũ kỹ thuật viên giàu kinh nghiệm ,
                nhiệt huyết , năng động yêu nghề Công ty TNHH DVTM và SX Minh
                Hiền đã mang đến cho khách hàng hàng chục nghìn mẫu sản phẩm đa
                dạng về chủng loại và màu sắc nổi trội tại thị trường Việt Nam
                và nhiều nước khác trên thế giới.
              </p>
              <p>
                Công ty TNHH DVTM và SX Minh Hiền luôn nỗ lực không ngừng cho
                mục tiêu ứng dụng công nghệ và kinh nghiệm cạnh tranh trên thị
                trường quốc tế, phát triển nhu cầu nội địa. Thông qua tối ưu hóa
                dây chuyền sản xuất thông minh nhằm tạo ra những sản phẩm vượt
                trội về chất lượng, mang đến giải pháp toàn diện – hiện đại về
                sản phẩm.
              </p>
              <p>
                Công ty TNHH DVTM và SX Minh Hiền luôn tự hào là doanh nghiệp
                cung cấp sản phẩm sơn gỗ INCHEM cao cấp cho rất nhiều dự án lớn
                và khách hàng lớn như Landco, Việt’power, Woodsland và rất nhiều
                những khách hàng khác.
              </p>
              <p>
                Chúng tôi luôn xem khách hàng là trung tâm của mọi hoạt động.
                Công ty TNHH DVTM và SX Minh Hiền cam kết khẳng định vị thế đối
                tác chiến lược trong lĩnh vực sơn gỗ nội thất.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
