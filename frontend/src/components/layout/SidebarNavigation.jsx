import { NavLink } from "react-router-dom";
import { BookOpen, Home, Settings, Sparkles, LogOut } from "lucide-react";

export default function SidebarNavigation() {
  const navItems = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "My Courses", path: "/courses", icon: BookOpen },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl flex flex-col justify-between hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-indigo-500 p-2 rounded-xl text-white">
            <Sparkles size={24} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Agentic.AI
          </h1>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-6 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}