import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { displayName } from "../utils/formatters";
import useNotificationCount from "../hooks/useNotificationCount";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { count: notifCount } = useNotificationCount('admin');
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

  const sidebarLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { to: "/admin/residents", label: "Warga Desa", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { to: "/admin/admins", label: "Admin Desa", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    { to: "/admin/queues", label: "Antrian", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { to: "/admin/complaints", label: "Aduan", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
    { to: "/admin/smart-letters", label: "Surat Pintar", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { to: "/admin/notifications", label: "Notifikasi", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Overlay: hanya untuk mobile, saat sidebar dibuka sebagai drawer */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={closeSidebar} />}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r shadow-sm transform transition-all duration-200 overflow-hidden ${
          sidebarOpen
            ? "w-64 translate-x-0"
            : "w-64 -translate-x-full md:w-0 md:translate-x-0 md:border-r-0"
        }`}
      >
        <div className="p-4 border-b h-16 flex items-center justify-between whitespace-nowrap">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/desa_cemara.jpg" alt="Desa Cemara" className="h-8 w-auto rounded flex-shrink-0" />
            <div>
              <h1 className="text-lg font-bold text-blue-600">Desa Cemara</h1>
              <p className="text-xs text-gray-500">Panel Admin</p>
            </div>
          </Link>
          <button onClick={closeSidebar} className="p-1 rounded hover:bg-gray-100 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-2 space-y-1 whitespace-nowrap">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => window.innerWidth < 768 && closeSidebar()}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} /></svg>
              {link.label}
              {link.to === "/admin/notifications" && notifCount > 0 && (
                <span className="ml-auto flex-shrink-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {notifCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* header */}
        <header className="bg-white border-b h-16 shadow-sm px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen((prev) => !prev)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
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