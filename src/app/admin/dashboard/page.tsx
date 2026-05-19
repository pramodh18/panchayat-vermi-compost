import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-earth-50 px-4 py-8">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white border-2 border-primary-100 p-6 sm:p-8 shadow-sm">
        <AdminDashboard />
      </div>
    </main>
  );
}
