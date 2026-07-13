import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';

export default function ManageQueues() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQueues();
  }, []);

  async function fetchQueues() {
    try {
      const res = await api.get('/admin/submissions/queues');
      setQueues(res.data);
    } catch {
      toast.error('Gagal memuat data antrian');
    } finally {
      setLoading(false);
    }
  }

  const openModal = (q) => {
    setSelected(q);
    setStatus(q.status || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/admin/submissions/queues/${selected.id}`, {
        status,
      });
      toast.success('Antrian berhasil diperbarui');
      setSelected(null);
      fetchQueues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui antrian');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Antrian</h1>

      {queues.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Belum ada data antrian.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">NIK</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Jenis Layanan</th>
                <th className="px-4 py-3 font-medium">Nomor Antrian</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {queues.map((q, i) => (
                <tr
                  key={q.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openModal(q)}
                >
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">{q.nik}</td>
                  <td className="px-4 py-3">{q.nama_lengkap}</td>
                  <td className="px-4 py-3">{q.tanggal ? new Date(q.tanggal).toLocaleDateString('id-ID') : '-'}</td>
                  <td className="px-4 py-3">{q.jenis_layanan}</td>
                  <td className="px-4 py-3">{q.nomor_antrian ?? '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Atur Antrian</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Antrian</label>
                <input
                  type="text"
                  value={selected.nomor_antrian ?? '-'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih status</option>
                  <option value="Pending">Pending</option>
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setSelected(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
