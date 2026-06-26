import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [namaPengadu, setNamaPengadu] = useState('');
  const [isiAduan, setIsiAduan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaPengadu.trim()) {
      toast.error('Nama pengadu harus diisi');
      return;
    }
    if (isiAduan.trim().length < 20) {
      toast.error('Isi aduan minimal 20 karakter');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/warga/submissions/complaints', {
        nama_pengadu: namaPengadu,
        isi_aduan: isiAduan,
      });
      toast.success('Aduan berhasil dikirim');
      navigate('/warga/history');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengirim aduan';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Aduan</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pengadu</label>
          <input
            type="text"
            value={namaPengadu}
            onChange={(e) => setNamaPengadu(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Masukkan nama lengkap Anda"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Isi Aduan</label>
          <textarea
            value={isiAduan}
            onChange={(e) => setIsiAduan(e.target.value)}
            rows={6}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tuliskan aduan Anda secara jelas (minimal 20 karakter)..."
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            {isiAduan.length}/20 karakter minimal
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {submitting ? 'Mengirim...' : 'Kirim Aduan'}
        </button>
      </form>
    </div>
  );
}
