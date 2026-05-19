import type { Bilingual } from "@/lib/content";

interface BilingualTextProps {
  text: Bilingual;
  primary?: "te" | "en";
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
}

export function BilingualText({
  text,
  primary = "te",
  className = "",
  primaryClassName = "",
  secondaryClassName = "text-gray-600",
}: BilingualTextProps) {
  const primaryText = primary === "te" ? text.te : text.en;
  const secondaryText = primary === "te" ? text.en : text.te;

  return (
    <div className={className}>
      <p className={`font-telugu leading-relaxed ${primaryClassName}`}>{primaryText}</p>
      <p className={`text-sm mt-1 ${secondaryClassName}`}>{secondaryText}</p>
    </div>
  );
}
