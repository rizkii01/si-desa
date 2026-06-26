import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { displayName } from "../utils/formatters";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/admin/residents", label: "Warga Desa", icon: "👥" },
    { to: "/admin/admins", label: "Admin Desa", icon: "⚙️" },
    { to: "/admin/letters", label: "Pengajuan Surat", icon: "📄" },
    { to: "/admin/queues", label: "Antrian", icon: "🔢" },
    { to: "/admin/complaints", label: "Aduan", icon: "💬" },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={closeSidebar} />}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-sm transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <img src="/images/desa_cemara.jpg" alt="Desa Cemara" className="h-8 w-auto rounded" />
              <div>
                <h1 className="text-lg font-bold text-blue-600">Desa Cemara</h1>
                <p className="text-xs text-gray-500">Panel Admin</p>
              </div>
            </div>
          </div>
          <button onClick={closeSidebar} className="md:hidden p-1 rounded hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-2 space-y-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={closeSidebar}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* header */}
        <header className="bg-white border-b shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-base md:text-lg font-semibold text-gray-800 truncate">Admin Dashboard</h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs md:text-sm text-gray-600 truncate max-w-25 md:max-w-none">{displayName(user)}</span>
            <button onClick={logout} className="text-xs md:text-sm text-red-500 hover:text-red-700 font-medium">
              Logout
            </button>
          </div>
        </header>
        {/* end header */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
