import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OrderForm } from "@/components/order/OrderForm";
import { PanchayatInfoCard } from "@/components/home/PanchayatInfoCard";
import { BenefitsSection } from "@/components/home/BenefitsSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-12 space-y-8 pt-6">
        <PanchayatInfoCard />
        <BenefitsSection />

        <section>
          <h2 className="text-lg font-bold text-primary-800 mb-4 text-center font-telugu">
            ఆన్‌లైన్ ఆర్డర్
            <span className="block text-sm font-semibold text-gray-600 mt-1">Online Order</span>
          </h2>
          <OrderForm />
        </section>
      </main>
      
    </>
  );
}
