import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="min-h-screen bg-earth-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white border-2 border-primary-100 p-8 shadow-sm">
        <AdminLoginForm />
      </div>
    </main>
  );
}
