import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-2">
              <img src="/images/desa_cemara.jpg" alt="Desa Cemara" className="h-8 md:h-10 w-auto rounded" />
              <span className="text-lg md:text-xl font-bold text-blue-600">desa cemara</span>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => scrollTo('profil')} className="text-gray-600 hover:text-blue-600 cursor-pointer">Profil Desa</button>
              <button onClick={() => scrollTo('layanan')} className="text-gray-600 hover:text-blue-600 cursor-pointer">Layanan</button>
              <button onClick={() => scrollTo('kontak')} className="text-gray-600 hover:text-blue-600 cursor-pointer">Kontak</button>
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/warga/dashboard'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700"
                >
                  Login
                </Link>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t bg-white shadow-lg">
            <div className="px-4 py-3 space-y-1">
              <button onClick={() => scrollTo('profil')} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                Profil Desa
              </button>
              <button onClick={() => scrollTo('layanan')} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                Layanan
              </button>
              <button onClick={() => scrollTo('kontak')} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                Kontak
              </button>
              <div className="border-t pt-2 mt-2">
                {user ? (
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : '/warga/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    className="block text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <section className="min-h-screen flex items-center bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center lg:text-left lg:flex items-center gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                SELAMAT DATANG DI<br />
                <span className="text-blue-600">LAYANAN DESA CEMARA</span>
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Platform pelayanan administrasi desa yang cepat, transparan, dan mudah diakses.
              </p>
              {!user && (
                <Link
                  to="/login"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full text-lg hover:bg-blue-700"
                >
                  Masuk ke Layanan →
                </Link>
              )}
            </div>
            <div className="lg:w-1/2 mt-8 lg:mt-0">
              <img
                src="/images/image1.jpeg"
                alt="Pelayanan Desa Cemara"
                className="w-full max-h-[450px] object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="profil" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Profil Desa Cemara</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4">Visi</h4>
              <p className="text-gray-600 italic">"Terwujudnya Desa Cemara yang Mandiri, Sejahtera, Berakhlak Mulia dan Berdaya Saing"</p>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4">Misi</h4>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Pelayanan publik cepat, mudah dan profesional</li>
                <li>✓ Tata kelola pemerintahan yang transparan dan akuntabel</li>
                <li>✓ Pemberdayaan ekonomi masyarakat melalui UMKM dan BUMDes</li>
                <li>✓ Pelestarian budaya dan lingkungan hidup</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="layanan" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Layanan Kami</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📄', title: 'Pengajuan Surat Pengantar', desc: 'SKCK, Domisili, Usaha, Keterangan Tidak Mampu, dll' },
              { icon: '👥', title: 'Ambil Antrian Pelayanan', desc: 'Pengurusan KK, KTP, Akta Kelahiran, dan lainnya' },
              { icon: '💬', title: 'Aduan & Aspirasi', desc: 'Sampaikan keluhan atau saran untuk perbaikan desa' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h5 className="text-lg font-semibold mb-2">{item.title}</h5>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kontak" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Kontak & Lokasi</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h5 className="text-lg font-semibold mb-4">Kontak Kami</h5>
              <p className="text-gray-600"><strong>Alamat:</strong> Jl. Raya Cemara No. 1, Desa Cemara</p>
              <p className="text-gray-600"><strong>Telepon:</strong> (0338) 123-456</p>
              <p className="text-gray-600"><strong>Email:</strong> info@desacemara.desa.id</p>
              <p className="text-gray-600"><strong>Jam Kerja:</strong> Senin–Jumat, 08:00–16:00 WIB</p>
            </div>
            <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center text-gray-500">
              Peta Lokasi
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-6 text-center">
        <p>&copy; {new Date().getFullYear()} Pemerintah Desa Cemara.</p>
        <p className="text-sm text-gray-400">Dibuat untuk mempermudah pelayanan masyarakat</p>
      </footer>
    </div>
  );
}
