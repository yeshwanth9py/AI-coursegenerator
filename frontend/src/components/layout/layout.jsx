import { Outlet } from "react-router-dom";
import SidebarNavigation from "./SidebarNavigation";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 font-sans overflow-hidden">
      <SidebarNavigation />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 z-10 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}