import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { displayName } from '../../utils/formatters';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/warga/submissions/history')
      .then((res) => setStats(res.data))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Gagal memuat data';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: 'Total Antrian',
      value: stats?.antrian?.length ?? 0,
      color: 'bg-green-500',
      icon: '🔢',
    },
    {
      title: 'Total Pengaduan',
      value: stats?.pengaduan?.length ?? 0,
      color: 'bg-purple-500',
      icon: '💬',
    },
  ];

  const quickActions = [
    {
      label: 'Surat Pintar',
      desc: 'Buat permohonan surat baru',
      path: '/warga/smart-submit-letter',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      icon: '📝',
    },
    {
      label: 'Ambil Antrian',
      desc: 'Ambil nomor antrian layanan',
      path: '/warga/submit-queue',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      icon: '🔢',
    },
    {
      label: 'Buat Aduan',
      desc: 'Sampaikan keluhan atau pengaduan',
      path: '/warga/submit-complaint',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      icon: '💬',
    },
    {
      label: 'Riwayat Surat',
      desc: 'Cek status smart letter Anda',
      path: '/warga/smart-letters',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      icon: '📋',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {displayName(user)}!
        </h1>
        <p className="text-gray-500 mt-1">
          Kelola pengajuan surat, antrian, dan pengaduan Anda di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4"
          >
            <div className={`w-14 h-14 ${card.color} rounded-xl flex items-center justify-center text-2xl`}>
              {card.icon}
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className={`rounded-xl border p-5 text-left transition ${action.color}`}
          >
            <span className="text-3xl">{action.icon}</span>
            <h3 className="font-semibold text-gray-900 mt-2">{action.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
