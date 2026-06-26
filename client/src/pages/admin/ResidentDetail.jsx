import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

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

  const fields = [
    { label: 'NIK', name: 'nik', type: 'text' },
    { label: 'Nama Lengkap', name: 'nama_lengkap', type: 'text' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'No HP', name: 'no_hp', type: 'text' },
    { label: 'Alamat', name: 'alamat', type: 'textarea' },
    { label: 'Tempat Lahir', name: 'tempat_lahir', type: 'text' },
    { label: 'Tanggal Lahir', name: 'tanggal_lahir', type: 'date' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Detail Warga</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 max-w-lg space-y-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                name={f.name}
                value={form[f.name] || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type={f.type}
                name={f.name}
                value={form[f.name] || ''}
                onChange={handleChange}
                maxLength={f.name === 'nik' ? 16 : undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
          <select
            name="jenis_kelamin"
            value={form.jenis_kelamin || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}
