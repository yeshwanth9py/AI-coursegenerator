import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Navbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}