import { BilingualText } from "@/components/ui/BilingualText";
import { content } from "@/lib/content";

export function BenefitsSection() {
  return (
    <section>
      <h2 className="text-xl font-bold text-primary-800 mb-6 text-center">
        ప్రయోజనాలు / Benefits
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {content.benefits.map((item) => (
          <article
            key={item.title.en}
            className="rounded-xl border-2 border-primary-100 bg-white p-5 shadow-sm"
          >
            <span className="text-2xl mb-2 block" aria-hidden>
              🌱
            </span>
            <BilingualText
              text={item.title}
              primaryClassName="font-bold text-primary-800"
              secondaryClassName="text-gray-500 text-xs"
            />
            <BilingualText
              text={item.desc}
              className="mt-2"
              primaryClassName="text-sm text-gray-700"
              secondaryClassName="text-xs text-gray-500"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
