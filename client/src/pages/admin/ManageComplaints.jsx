import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');
  const [balasan, setBalasan] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      const res = await api.get('/admin/submissions/complaints');
      setComplaints(res.data);
    } catch {
      toast.error('Gagal memuat data aduan');
    } finally {
      setLoading(false);
    }
  }

  const openModal = (c) => {
    setSelected(c);
    setStatus(c.status || '');
    setBalasan(c.balasan_admin || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/admin/submissions/complaints/${selected.id}/reply`, {
        status,
        balasan_admin: balasan,
      });
      toast.success('Balasan aduan berhasil dikirim');
      setSelected(null);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim balasan');
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Aduan</h1>

      {complaints.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Belum ada data aduan.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Isi Aduan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Balasan Admin</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.map((c, i) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openModal(c)}
                >
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">{c.nama_warga || c.nama_lengkap}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{c.isi_aduan}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">{c.balasan_admin || '-'}</td>
                  <td className="px-4 py-3">{c.tanggal_pengaduan ? new Date(c.tanggal_pengaduan).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Balas Aduan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Pilih status</option>
                  <option value="Baru">Baru</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Balasan Admin</label>
                <textarea
                  value={balasan}
                  onChange={(e) => setBalasan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                  {saving ? 'Menyimpan...' : 'Kirim'}
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
