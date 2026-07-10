import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_KELUARGA = ['', 'Kepala Keluarga', 'Istri', 'Anak', 'Famili Lain', 'Lainnya'];
const AGAMA = ['', 'Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const PENDIDIKAN = ['', 'Tidak Sekolah', 'SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3'];
const PERKAWINAN = ['', 'Kawin', 'Belum Kawin', 'Cerai Hidup', 'Cerai Mati'];
const RT_OPTIONS = ['', '001', '002', '003', '004', '005'];
const RW_OPTIONS = ['', '001', '002', '003'];

export default function ResidentDetail() {
  const { id } = useParams();
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/admin/residents/${id}`)
      .then((res) => {
        setResident(res.data);
        setForm(res.data);
      })
      .catch(() => toast.error('Gagal memuat data warga'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/residents/${id}`, form);
      toast.success('Data warga berhasil diperbarui');
      const res = await api.get(`/admin/residents/${id}`);
      setResident(res.data);
      setForm(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui data');
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

  if (!resident) {
    return (
      <div className="text-center py-20 text-gray-500">Data warga tidak ditemukan.</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Detail Warga</h1>

      {/* Data Identitas */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Data Identitas</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
            <input name="nik" value={form.nik || ''} onChange={handleChange} maxLength={16} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input name="nama_lengkap" value={form.nama_lengkap || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
            <input name="tempat_lahir" value={form.tempat_lahir || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
            <input name="tanggal_lahir" type="date" value={form.tanggal_lahir || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
            <select name="jenis_kelamin" value={form.jenis_kelamin || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
              <option value="">Pilih</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
            <select name="agama" value={form.agama || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
              {AGAMA.map(o => <option key={o} value={o}>{o || 'Pilih'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan Terakhir</label>
            <select name="pendidikan_terakhir" value={form.pendidikan_terakhir || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
              {PENDIDIKAN.map(o => <option key={o} value={o}>{o || 'Pilih'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
            <input name="pekerjaan" value={form.pekerjaan || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Perkawinan</label>
            <select name="status_perkawinan" value={form.status_perkawinan || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
              {PERKAWINAN.map(o => <option key={o} value={o}>{o || 'Pilih'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kewarganegaraan</label>
            <select name="kewarganegaraan" value={form.kewarganegaraan || 'WNI'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
              <option value="WNI">WNI</option>
              <option value="WNA">WNA</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ayah</label>
            <input name="nama_ayah" value={form.nama_ayah || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ibu</label>
            <input name="nama_ibu" value={form.nama_ibu || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>

        <hr className="border-gray-200" />

        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Data Domisili & Keluarga</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea name="alamat" value={form.alamat || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No KK</label>
            <input name="no_kk" value={form.no_kk || ''} onChange={handleChange} maxLength={20} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RT</label>
            <select name="rt" value={form.rt || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
              <option value="">Pilih</option>
              {RT_OPTIONS.filter(o => o).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RW</label>
            <select name="rw" value={form.rw || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
              <option value="">Pilih</option>
              {RW_OPTIONS.filter(o => o).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Keluarga</label>
            <select name="status_keluarga" value={form.status_keluarga || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
              {STATUS_KELUARGA.map(o => <option key={o} value={o}>{o || 'Pilih'}</option>)}
            </select>
          </div>
        </div>

        <hr className="border-gray-200" />
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          Data kontak (email, no HP) dan foto profil hanya bisa diakses dan diubah oleh warga sendiri melalui halaman profil masing-masing.
        </div>

        <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition text-sm">
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}
