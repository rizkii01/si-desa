import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { displayName } from "../utils/formatters";
import useNotificationCount from "../hooks/useNotificationCount";

export default function CitizenLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);
  const { count: notifCount } = useNotificationCount("warga");

  const links = [
    { to: "/warga/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { to: "/warga/profile", label: "Profil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { to: "/warga/edit-profile", label: "Edit Profil", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
    { to: "/warga/smart-submit-letter", label: "Surat Pintar", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { to: "/warga/smart-letters", label: "Riwayat Surat", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { to: "/warga/history", label: "Riwayat Aktivitas", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { to: "/warga/submit-queue", label: "Ambil Antrian", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { to: "/warga/submit-complaint", label: "Aduan", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
    {
      to: "/warga/notifications",
      label: "Notifikasi",
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={closeSidebar} />}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r shadow-sm transform transition-all duration-200 overflow-hidden ${
          sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-0 md:translate-x-0 md:border-r-0"
        }`}
      >
        <div className="p-4 border-b h-16 flex items-center justify-between whitespace-nowrap">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/desa_cemara.jpg" alt="Desa Cemara" className="h-8 w-auto rounded flex-shrink-0" />
            <div>
              <h1 className="text-lg font-bold text-blue-600">Desa Cemara</h1>
              <p className="text-xs text-gray-500">Portal Warga</p>
            </div>
          </Link>
          <button onClick={closeSidebar} className="p-1 rounded hover:bg-gray-100 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-2 space-y-1 whitespace-nowrap">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => window.innerWidth < 768 && closeSidebar()}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
              </svg>
              {link.label}
              {link.to === "/warga/notifications" && notifCount > 0 && <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-500 rounded-full">{notifCount}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b h-16 shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen((prev) => !prev)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-base md:text-lg font-semibold text-gray-800 truncate">Portal Warga</h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs md:text-sm text-gray-600 truncate max-w-25 md:max-w-none">{displayName(user)}</span>
            <button onClick={logout} className="text-xs md:text-sm text-red-500 hover:text-red-700 font-medium">
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
