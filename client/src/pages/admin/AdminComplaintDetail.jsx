import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [balasan, setBalasan] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get(`/admin/submissions/complaints/${id}`)
      .then((res) => {
        if (cancelled) return;
        setComplaint(res.data);
        setStatus(res.data.status || '');
        setBalasan(res.data.balasan_admin || '');
      })
      .catch(() => {
        if (cancelled) return;
        toast.error('Pengaduan tidak ditemukan');
        navigate('/admin/complaints');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, navigate]);

  const refreshDetail = useCallback(async () => {
    try {
      const res = await api.get(`/admin/submissions/complaints/${id}`);
      setComplaint(res.data);
      setStatus(res.data.status || '');
      setBalasan(res.data.balasan_admin || '');
    } catch {
      toast.error('Gagal memuat ulang data');
    }
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!status) return toast.error('Status harus dipilih');
    setSaving(true);
    try {
      await api.put(`/admin/submissions/complaints/${id}/reply`, {
        status,
        balasan_admin: balasan,
      });
      toast.success('Aduan berhasil diperbarui');
      refreshDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui aduan');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/admin/complaints')}
        className="mb-5 text-sm text-gray-500 hover:text-blue-600"
      >
        &larr; Kembali ke Daftar Aduan
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Detail Pengaduan</h1>
            <p className="text-sm text-gray-500 mt-1">No. {complaint.id}</p>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Nama Pengadu</p>
            <p className="font-medium text-gray-800">{complaint.nama_warga || complaint.nama_lengkap || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">NIK</p>
            <p className="font-medium text-gray-800">{complaint.nik || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">No. HP</p>
            <p className="font-medium text-gray-800">{complaint.no_hp || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Alamat</p>
            <p className="font-medium text-gray-800">{complaint.alamat_warga || '-'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 text-xs mb-0.5">Tanggal Pengaduan</p>
            <p className="font-medium text-gray-800">
              {complaint.tanggal_pengaduan
                ? new Date(complaint.tanggal_pengaduan).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })
                : '-'}
            </p>
          </div>
        </div>

        <div className="mb-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Isi Aduan</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {complaint.isi_aduan}
          </div>
        </div>

        {complaint.balasan_admin && (
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Balasan Admin Sebelumnya</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
              {complaint.balasan_admin}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Ubah Status & Balas</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              rows={4}
              placeholder="Tulis balasan untuk pengaduan ini..."
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/complaints')}
              className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
