import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { displayName } from '../utils/formatters';

export default function CitizenLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/warga/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/warga/profile', label: 'Profil', icon: '👤' },
    { to: '/warga/edit-profile', label: 'Edit Profil', icon: '✏️' },
    { to: '/warga/submit-letter', label: 'Ajukan Surat', icon: '📄' },
    { to: '/warga/submit-queue', label: 'Ambil Antrian', icon: '🔢' },
    { to: '/warga/submit-complaint', label: 'Aduan', icon: '💬' },
    { to: '/warga/history', label: 'Riwayat', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-2">
              <img src="/images/desa_cemara.jpg" alt="Desa Cemara" className="h-7 md:h-9 w-auto rounded" />
              <span className="text-lg md:text-xl font-bold text-blue-600">Desa Cemara</span>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="text-xs md:text-sm text-gray-600 truncate max-w-[100px] md:max-w-none">
                Halo, {displayName(user)}
              </span>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              <button onClick={logout} className="text-xs md:text-sm text-red-500 hover:text-red-700 font-medium hidden md:inline">
                Logout
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t bg-white shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 mt-2 border-t pt-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="pt-14 md:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="hidden md:flex flex-wrap gap-2 mb-6">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border'
                  }`
                }
              >
                {link.icon} {link.label}
              </NavLink>
            ))}
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
