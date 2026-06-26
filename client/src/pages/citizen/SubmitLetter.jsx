import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { displayName } from '../../utils/formatters';

const LAYANAN = [
  'Surat Pengantar SKCK',
  'Surat Keterangan Domisili',
  'Surat Pengantar Usaha',
  'Surat Keterangan Tidak Mampu',
  'Surat Pengantar Nikah',
  'Surat Keterangan Usaha (SKU)',
  'Surat Pengantar Pindah Domisili',
  'Surat Keterangan Penghasilan',
  'Lainnya',
];

export default function SubmitLetter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [jenisLayanan, setJenisLayanan] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [berkas, setBerkas] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/warga/profile')
      .then((res) => setProfile(res.data))
      .catch(() => toast.error('Gagal memuat data pengguna'))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e) => {
    setBerkas([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jenisLayanan || !keperluan) {
      toast.error('Lengkapi semua field yang wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('jenis_layanan', jenisLayanan);
      fd.append('keperluan', keperluan);
      berkas.forEach((file) => fd.append('berkas', file));
      await api.post('/warga/submissions/letters', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Surat berhasil diajukan');
      navigate('/warga/history');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengajukan surat';
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

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajukan Surat</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
            <input value={profile?.nik || user?.nik || ''} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input value={displayName(profile) || displayName(user)} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Layanan</label>
          <select
            value={jenisLayanan}
            onChange={(e) => setJenisLayanan(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">-- Pilih Jenis Surat --</option>
            {LAYANAN.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keperluan</label>
          <textarea
            value={keperluan}
            onChange={(e) => setKeperluan(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Jelaskan keperluan Anda..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Berkas Pendukung (JPG/PNG/PDF)</label>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {berkas.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">{berkas.length} file dipilih</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {submitting ? 'Mengirim...' : 'Ajukan Surat'}
        </button>
      </form>
    </div>
  );
}
