import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = {
  nik: '', nama_lengkap: '', email: '', no_hp: '', alamat: '', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: '',
  no_kk: '', rt: '', rw: '', status_keluarga: '', agama: '', pekerjaan: '', pendidikan_terakhir: '',
  status_perkawinan: '', nama_ayah: '', nama_ibu: '', kewarganegaraan: 'WNI',
};

const STATUS_KELUARGA = ['', 'Kepala Keluarga', 'Istri', 'Anak', 'Famili Lain', 'Lainnya'];
const AGAMA = ['', 'Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const PENDIDIKAN = ['', 'Tidak Sekolah', 'SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3'];
const PERKAWINAN = ['', 'Kawin', 'Belum Kawin', 'Cerai Hidup', 'Cerai Mati'];
const RT_OPTIONS = ['', '001', '002', '003', '004', '005'];
const RW_OPTIONS = ['', '001', '002', '003'];

export default function ManageResidents() {
  const navigate = useNavigate();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deactivateId, setDeactivateId] = useState(null);
  const [activateId, setActivateId] = useState(null);

  const [filterRt, setFilterRt] = useState('');
  const [filterRw, setFilterRw] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    fetchResidents();
  }, []);

  async function fetchResidents() {
    try {
      const params = new URLSearchParams();
      if (filterRt) params.set('rt', filterRt);
      if (filterRw) params.set('rw', filterRw);
      if (filterSearch) params.set('search', filterSearch);
      const qs = params.toString();
      const res = await api.get(`/admin/residents${qs ? '?' + qs : ''}`);
      setResidents(res.data);
    } catch {
      toast.error('Gagal memuat data warga');
    } finally {
      setLoading(false);
    }
  }

  function handleFilter() {
    setLoading(true);
    fetchResidents();
  }

  function clearFilter() {
    setFilterRt('');
    setFilterRw('');
    setFilterSearch('');
    setLoading(true);
    fetchResidents();
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/residents', form);
      toast.success('Warga berhasil ditambahkan');
      setShowModal(false);
      setForm(emptyForm);
      fetchResidents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan warga');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await api.put(`/admin/residents/${id}/deactivate`);
      toast.success('Akun warga berhasil dinonaktifkan');
      setDeactivateId(null);
      fetchResidents();
    } catch {
      toast.error('Gagal menonaktifkan akun');
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.put(`/admin/residents/${id}/activate`);
      toast.success('Akun warga berhasil diaktifkan kembali');
      setActivateId(null);
      fetchResidents();
    } catch {
      toast.error('Gagal mengaktifkan akun');
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Warga</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Tambah Warga
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">RT</label>
          <select value={filterRt} onChange={(e) => setFilterRt(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            {RT_OPTIONS.map(o => <option key={o} value={o}>{o || 'Semua'}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">RW</label>
          <select value={filterRw} onChange={(e) => setFilterRw(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            {RW_OPTIONS.map(o => <option key={o} value={o}>{o || 'Semua'}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-600 mb-1">Cari Nama / NIK</label>
          <input value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Ketik nama atau NIK..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={handleFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          Cari
        </button>
        <button onClick={clearFilter}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition">
          Reset
        </button>
      </div>

      {residents.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Tidak ada data warga.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">No</th>
                <th className="px-4 py-3 font-medium">NIK</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">No KK</th>
                <th className="px-4 py-3 font-medium">RT</th>
                <th className="px-4 py-3 font-medium">RW</th>
                <th className="px-4 py-3 font-medium">Status Keluarga</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {residents.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">{r.nik}</td>
                  <td className="px-4 py-3">{r.nama_lengkap}</td>
                  <td className="px-4 py-3">{r.no_kk || '-'}</td>
                  <td className="px-4 py-3">{r.rt || '-'}</td>
                  <td className="px-4 py-3">{r.rw || '-'}</td>
                  <td className="px-4 py-3">{r.status_keluarga || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => navigate(`/admin/residents/${r.id}`)} className="text-blue-600 hover:underline text-sm">Detail</button>
                    <button onClick={() => navigate(`/admin/residents/${r.id}`)} className="text-green-600 hover:underline text-sm">Edit</button>
                    {r.is_active ? (
                      <button onClick={() => setDeactivateId(r.id)} className="text-red-600 hover:underline text-sm">Nonaktifkan</button>
                    ) : (
                      <button onClick={() => setActivateId(r.id)} className="text-green-600 hover:underline text-sm font-medium">Aktifkan</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah Warga */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Tambah Warga</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIK *</label>
                  <input name="nik" value={form.nik} onChange={handleChange} maxLength={16} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                  <input name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir *</label>
                  <input name="tempat_lahir" value={form.tempat_lahir} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir *</label>
                  <input name="tanggal_lahir" type="date" value={form.tanggal_lahir} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin *</label>
                  <select name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    <option value="">Pilih</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No KK</label>
                  <input name="no_kk" value={form.no_kk} onChange={handleChange} maxLength={20} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RT</label>
                  <select name="rt" value={form.rt} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    <option value="">Pilih</option>
                    {RT_OPTIONS.filter(o => o).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RW</label>
                  <select name="rw" value={form.rw} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    <option value="">Pilih</option>
                    {RW_OPTIONS.filter(o => o).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Keluarga</label>
                  <select name="status_keluarga" value={form.status_keluarga} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    {STATUS_KELUARGA.map(o => <option key={o} value={o}>{o || 'Pilih'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
                  <select name="agama" value={form.agama} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    {AGAMA.map(o => <option key={o} value={o}>{o || 'Pilih'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan Terakhir</label>
                  <select name="pendidikan_terakhir" value={form.pendidikan_terakhir} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    {PENDIDIKAN.map(o => <option key={o} value={o}>{o || 'Pilih'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Perkawinan</label>
                  <select name="status_perkawinan" value={form.status_perkawinan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    {PERKAWINAN.map(o => <option key={o} value={o}>{o || 'Pilih'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
                  <input name="pekerjaan" value={form.pekerjaan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kewarganegaraan</label>
                  <select name="kewarganegaraan" value={form.kewarganegaraan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                    <option value="WNI">WNI</option>
                    <option value="WNA">WNA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ayah</label>
                  <input name="nama_ayah" value={form.nama_ayah} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ibu</label>
                  <input name="nama_ibu" value={form.nama_ibu} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-2">
                <p className="text-xs text-gray-500 mb-2">Data kontak (email, no HP) akan diisi oleh warga sendiri melalui halaman profil.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition text-sm">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setForm(emptyForm); }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition text-sm">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Nonaktifkan */}
      {deactivateId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Konfirmasi Nonaktifkan</h2>
            <p className="text-gray-600 text-sm mb-4">Apakah Anda yakin ingin menonaktifkan akun warga ini? Warga tidak akan bisa login sampai diaktifkan kembali.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDeactivate(deactivateId)} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition text-sm">
                Nonaktifkan
              </button>
              <button onClick={() => setDeactivateId(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition text-sm">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Aktifkan */}
      {activateId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Konfirmasi Aktifkan</h2>
            <p className="text-gray-600 text-sm mb-4">Apakah Anda yakin ingin mengaktifkan kembali akun warga ini? Warga akan bisa login setelah diaktifkan.</p>
            <div className="flex gap-3">
              <button onClick={() => handleActivate(activateId)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition text-sm">
                Aktifkan
              </button>
              <button onClick={() => setActivateId(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition text-sm">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
