import Image from "next/image";
import Link from "next/link";
import { BilingualText } from "@/components/ui/BilingualText";
import { content } from "@/lib/content";
import { PRICE_PER_KG } from "@/lib/constants";

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const local = digits.length === 12 ? digits.slice(2) : digits;
  return { display: local, tel: `+91${local}` };
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 border-b border-primary-100 last:border-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

export function PanchayatInfoCard() {
  const { display, tel } = formatPhone(content.phone);

  return (
    <section className="rounded-2xl bg-white border-2 border-primary-100 shadow-sm overflow-hidden">
      <div className="bg-primary-700 text-white px-5 py-4 text-center">
        <p className="font-telugu text-lg font-bold leading-snug">{content.panchayat.te}</p>
        <p className="text-sm text-primary-100 mt-1">{content.panchayat.en}</p>
      </div>

      <div className="relative h-36 bg-earth-50">
        <Image
          src="/images/vermicompost.svg"
          alt={content.product.name.en}
          fill
          className="object-contain p-4"
          sizes="400px"
          priority
        />
      </div>

      <div className="px-5">
        <InfoRow label="">
          <BilingualText
            text={content.product.name}
            primaryClassName="font-bold text-primary-800"
          />
          
          <p className="mt-3 inline-block rounded-lg bg-primary-50 border border-primary-200 px-4 py-2 font-bold text-primary-800">
            ₹{PRICE_PER_KG} / kg
          </p>
        </InfoRow>

        <InfoRow label="అధికారి / Official">
          <BilingualText
            text={content.official.name}
            primaryClassName="font-semibold text-earth-800"
          />
          <BilingualText
            text={content.official.designation}
            className="mt-1"
            primaryClassName="text-sm text-gray-600"
          />
        </InfoRow>

        <InfoRow label="స్థలం / Location">
          <BilingualText
            text={content.center.name}
            primaryClassName="text-sm font-medium text-earth-800"
          />
          <BilingualText
            text={content.center.availability}
            className="mt-2"
            primaryClassName="text-sm text-primary-700"
          />
        </InfoRow>

        <InfoRow label="ఫోన్ / Phone">
          <Link
            href={`tel:${tel}`}
            className="inline-flex items-center gap-2 text-xl font-bold text-primary-700 hover:text-primary-800"
          >
            <span aria-hidden>📞</span>
            {display}
          </Link>
        </InfoRow>
      </div>
    </section>
  );
}
