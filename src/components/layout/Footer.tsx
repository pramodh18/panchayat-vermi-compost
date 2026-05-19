import Link from "next/link";
import { content } from "@/lib/content";
import { BilingualText } from "@/components/ui/BilingualText";

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const local = digits.length === 12 ? digits.slice(2) : digits;
  return { display: local, tel: `+91${local}` };
}

export function Footer() {
  const { display, tel } = formatPhone(content.phone);

  return (
    <footer className="mt-8 border-t border-primary-100 bg-primary-800 text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-5">
        <BilingualText
          text={content.panchayat}
          primaryClassName="text-lg font-bold text-white"
          secondaryClassName="text-primary-100 text-sm"
        />
        <BilingualText
          text={content.product.slogan}
          primaryClassName="text-primary-100"
          secondaryClassName="text-primary-200 text-sm"
        />
        <div className="space-y-2 text-primary-50 text-sm">
          <p>
            <span className="font-semibold">📞 </span>
            <Link href={`tel:${tel}`} className="underline font-bold text-lg text-white">
              {display}
            </Link>
          </p>
          <BilingualText
            text={content.center.name}
            primaryClassName="text-primary-50"
            secondaryClassName="text-primary-200 text-xs"
          />
        </div>
        <p className="pt-4 text-xs text-primary-200 border-t border-primary-700">
          © {new Date().getFullYear()} {content.panchayat.en}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
