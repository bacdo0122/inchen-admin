import { PrismaClient, ProductGroup, ColorTone, ContentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Danh mục sản phẩm bám sát file yêu cầu
const PRODUCTS: Array<{ name: string; group: ProductGroup; gloss?: string }> = [
  // PU trong nhà
  { name: 'Sơn PU chống trầy xước', group: 'PU_INDOOR', gloss: 'bóng 20%' },
  { name: 'Sơn bóng PU', group: 'PU_INDOOR', gloss: '10/30/50/90%' },
  { name: 'Sơn lót PU', group: 'PU_INDOOR' },
  { name: 'Sơn lót PU trắng', group: 'PU_INDOOR' },
  { name: 'Sơn bóng PU trắng', group: 'PU_INDOOR', gloss: '10/30/50/90%' },
  // PU ngoài trời
  { name: 'Sơn lót PU ngoài trời', group: 'PU_OUTDOOR' },
  { name: 'Sơn bóng PU ngoài trời', group: 'PU_OUTDOOR', gloss: '30/90%' },
  { name: 'Sơn lót PU trắng ngoài trời', group: 'PU_OUTDOOR' },
  { name: 'Sơn bóng PU trắng ngoài trời', group: 'PU_OUTDOOR', gloss: '10%' },
  // NC
  { name: 'Sơn lót NC', group: 'NC' },
  { name: 'Sơn bóng NC', group: 'NC', gloss: '10/30/90%' },
  { name: 'Sơn lót NC trắng', group: 'NC' },
  { name: 'Sơn bóng NC trắng', group: 'NC', gloss: '10/30%' },
  // UV
  { name: 'Sơn bóng UV', group: 'UV' },
  { name: 'UV Vacuum', group: 'UV' },
  // Khác
  { name: 'Bột trám trét', group: 'OTHER' },
  { name: 'Bột bả tự nhiên', group: 'OTHER' },
  { name: 'Sơn bóng hệ nước', group: 'OTHER' },
  { name: 'Dầu', group: 'OTHER' },
  { name: 'Sơn PU Modified', group: 'OTHER' },
];

async function main() {
  // Admin
  const email = process.env.ADMIN_EMAIL ?? 'admin@inchemminhhien.com.vn';
  const password = process.env.ADMIN_PASSWORD ?? '123456';
  const name = process.env.ADMIN_NAME ?? 'Admin';
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    update: { name },
    create: { email, passwordHash, name },
  });
  console.log(`✓ Admin: ${email}`);

  // Products
  let order = 0;
  for (const p of PRODUCTS) {
    const slug = slugify(`${p.name} ${p.gloss ?? ''}`);
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name: p.name,
        group: p.group,
        gloss: p.gloss,
        status: ContentStatus.PUBLISHED,
        order: order++,
      },
    });
  }
  console.log(`✓ Products: ${PRODUCTS.length}`);

  // Vài màu mẫu (bảng màu thực upload qua admin)
  const sampleColors: Array<{ code: string; name: string; tone: ColorTone; hex: string }> = [
    { code: 'SW 6814', name: 'Breathtaking', tone: 'COOL', hex: '#3E6E8E' },
    { code: 'SW 6634', name: 'Copper Harbor', tone: 'WARM', hex: '#C8794F' },
    { code: 'SW 7005', name: 'Pure White', tone: 'LIGHT', hex: '#EDECE6' },
    { code: 'SW 7069', name: 'Iron Ore', tone: 'DARK', hex: '#434341' },
  ];
  let corder = 0;
  for (const c of sampleColors) {
    const existing = await prisma.color.findFirst({ where: { code: c.code } });
    if (!existing) {
      await prisma.color.create({ data: { ...c, order: corder++ } });
    }
  }
  console.log(`✓ Colors (mẫu): ${sampleColors.length}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
