import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      <Sidebar />
      <main className="flex-1 min-w-0 px-8 py-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
