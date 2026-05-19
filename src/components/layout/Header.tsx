import Link from "next/link";
import { content } from "@/lib/content";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-primary-700 truncate">
            ఆంధ్ర ప్రదేశ్ ప్రభుత్వం
          </span>
          <span className="font-telugu text-base font-bold text-primary-800 sm:text-lg leading-tight truncate">
            {content.panchayat.te}
          </span>
          <span className="text-xs text-gray-600 truncate hidden sm:block">
            {content.panchayat.en}
          </span>
        </Link>
        <nav className="shrink-0">
          <Link
            href="#order"
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 min-h-11 flex items-center"
          >
            ఆర్డర్
          </Link>
        </nav>
      </div>
    </header>
  );
}
