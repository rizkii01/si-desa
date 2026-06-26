import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';

export default function ManageLetters() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('');
  const [catatan, setCatatan] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLetters();
  }, []);

  async function fetchLetters() {
    try {
      const res = await api.get('/admin/submissions/letters');
      setLetters(res.data);
    } catch {
      toast.error('Gagal memuat data surat');
    } finally {
      setLoading(false);
    }
  }

  const openModal = (letter) => {
    setSelected(letter);
    setStatus(letter.status || '');
    setCatatan(letter.catatan_admin || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/admin/submissions/letters/${selected.id}/status`, {
        status,
        catatan_admin: catatan,
      });
      toast.success('Status surat berhasil diperbarui');
      setSelected(null);
      fetchLetters();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status');
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengajuan Surat</h1>

      {letters.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Belum ada pengajuan surat.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">NIK</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Jenis Layanan</th>
                <th className="px-4 py-3 font-medium">Keperluan</th>
                <th className="px-4 py-3 font-medium">Berkas</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Catatan Admin</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {letters.map((l, i) => (
                <tr
                  key={l.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openModal(l)}
                >
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">{l.nik}</td>
                  <td className="px-4 py-3">{l.nama_lengkap}</td>
                  <td className="px-4 py-3">{l.jenis_layanan}</td>
                  <td className="px-4 py-3">{l.keperluan}</td>
                  <td className="px-4 py-3">
                    {l.berkas?.length > 0 ? (
                      <a
                        href={l.berkas[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Lihat
                      </a>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3">{l.catatan_admin || '-'}</td>
                  <td className="px-4 py-3">{l.tanggal_pengajuan ? new Date(l.tanggal_pengajuan).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Update Status Surat</h2>
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
                  <option value="Pending">Pending</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Admin</label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
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
