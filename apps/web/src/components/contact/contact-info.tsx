import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { COMPANY } from '@inchem/shared';
import { telHref } from '@/lib/contact';

/** Khối "Thông Tin Liên Hệ" + bản đồ — dùng ở trang chủ & trang liên hệ. */
export function ContactInfo() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(COMPANY.address)}&output=embed`;

  return (
    <div>
      <h3 className="text-xl font-bold text-navy">Thông Tin Liên Hệ</h3>
      <p className="mt-1 text-sm font-medium uppercase text-muted-fg">{COMPANY.name}</p>

      <ul className="mt-6 space-y-5">
        <InfoRow icon={<Phone className="size-5" />} label="Điện thoại">
          {COMPANY.hotline.map((h, i) => (
            <a key={h} href={telHref(h)} className="hover:text-indigo">
              {h}
              {i < COMPANY.hotline.length - 1 ? ' - ' : ''}
            </a>
          ))}
        </InfoRow>
        <InfoRow icon={<Mail className="size-5" />} label="Email">
          <a href={`mailto:${COMPANY.email}`} className="hover:text-indigo">
            {COMPANY.email}
          </a>
        </InfoRow>
        <InfoRow icon={<MapPin className="size-5" />} label="Địa chỉ">
          {COMPANY.address}
        </InfoRow>
      </ul>

      <div className="relative mt-6 overflow-hidden rounded-xl border border-border">
        <iframe
          src={mapSrc}
          title="Bản đồ Minh Hiền - Inchem"
          className="h-56 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a
          href={COMPANY.map}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-indigo shadow"
        >
          Mở trong Maps
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo/10 text-indigo">
        {icon}
      </span>
      <span className="text-sm">
        <span className="block text-muted-fg">{label}</span>
        <span className="font-semibold text-fg">{children}</span>
      </span>
    </li>
  );
}
