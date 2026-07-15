import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import QueueInvoice from '../../components/QueueInvoice';

const LAYANAN = [
  'Pengurusan Kartu Keluarga (KK)',
  'Pengurusan Kartu Tanda Penduduk (KTP)',
  'Pengurusan Akta Kelahiran',
  'Pengurusan Akta Kematian',
  'Pengurusan Akta Perkawinan',
  'Surat Pengantar Umum',
  'Pelayanan Administrasi Lainnya',
];

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function SubmitQueue() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tanggal, setTanggal] = useState('');
  const [jenisLayanan, setJenisLayanan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [queueResult, setQueueResult] = useState(null);

  useEffect(() => {
    api.get('/warga/profile')
      .then((res) => setProfile(res.data))
      .catch(() => toast.error('Gagal memuat data pengguna'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tanggal || !jenisLayanan) {
      toast.error('Lengkapi semua field');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/warga/submissions/queues', { tanggal, jenis_layanan: jenisLayanan });
      toast.success('Antrian berhasil diambil');
      setQueueResult(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengambil antrian';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (queueResult) {
    return (
      <div className="max-w-2xl">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-green-800">Antrian Berhasil Diambil!</h2>
              <p className="text-sm text-green-600">Nomor antrian Anda: <span className="font-bold text-lg">#{queueResult.nomor_antrian}</span></p>
            </div>
          </div>
          <p className="text-sm text-green-700 mb-4">Tunjukkan invoice di bawah kepada petugas di loket pelayanan desa.</p>
          <button
            onClick={() => setQueueResult(null)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Lihat Invoice
          </button>
        </div>

        <QueueInvoice queue={queueResult} onClose={() => setQueueResult(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ambil Antrian</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
            <input value={profile?.nik || user?.nik || ''} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input value={profile?.nama_lengkap || user?.nama_lengkap || ''} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            min={getTomorrow()}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Layanan</label>
          <select
            value={jenisLayanan}
            onChange={(e) => setJenisLayanan(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">-- Pilih Layanan --</option>
            {LAYANAN.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {submitting ? 'Mengirim...' : 'Ambil Antrian'}
        </button>
      </form>
    </div>
  );
}
