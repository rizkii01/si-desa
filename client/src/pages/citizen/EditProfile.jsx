import { useState, useEffect, useRef } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    no_hp: '',
    alamat: '',
  });
  const [readOnly, setReadOnly] = useState({
    nik: '',
    nama: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
  });
  const [fotoProfil, setFotoProfil] = useState(null);
  const [fotoPreview, setFotoPreview] = useState('');
  const [formLoaded, setFormLoaded] = useState(false);
  const originalFormRef = useRef(null);

  const isDirty = formLoaded && originalFormRef.current !== null && (
    JSON.stringify(form) !== JSON.stringify(originalFormRef.current) || fotoProfil !== null
  );

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirm = window.confirm("Anda memiliki data yang belum disimpan. Yakin ingin meninggalkan halaman ini?");
      if (confirm) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  useEffect(() => {
    api.get('/warga/profile')
      .then((res) => {
        const p = res.data;
        setReadOnly({
          nik: p.nik || '',
          nama_lengkap: p.nama_lengkap || '',
          jenis_kelamin: p.jenis_kelamin || '',
          tanggal_lahir: p.tanggal_lahir || '',
        });
        const profileData = {
          email: p.email || '',
          no_hp: p.no_hp || '',
          alamat: p.alamat || '',
        };
        setForm(profileData);
        if (p.foto_profil) setFotoPreview(p.foto_profil);
        originalFormRef.current = profileData;
        setFormLoaded(true);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Gagal memuat data';
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoProfil(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put('/warga/profile', form);
      if (fotoProfil) {
        const fd = new FormData();
        fd.append('foto_profil', fotoProfil);
        try {
          await api.post('/warga/profile/photo', fd);
        } catch (photoErr) {
          toast.error('Profil tersimpan, tapi gagal upload foto: ' + (photoErr.response?.data?.message || 'error'));
          setFormLoaded(false);
          navigate('/warga/profile');
          return;
        }
      }
      toast.success('Profil berhasil diperbarui');
      setFormLoaded(false);
      navigate('/warga/profile');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memperbarui profil';
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profil</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {fotoPreview ? (
              <img
                src={fotoPreview}
                alt="preview"
                className="w-28 h-28 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center text-4xl text-blue-600 font-bold border-2 border-gray-200">
                {readOnly.nama_lengkap?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <label className="mt-3 cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
            Ganti Foto
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
            <input value={readOnly.nik} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input value={readOnly.nama_lengkap} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
            <input value={readOnly.jenis_kelamin} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
            <input value={readOnly.tanggal_lahir} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
          </div>
        </div>

        <hr className="border-gray-200" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No HP</label>
          <input
            type="text"
            name="no_hp"
            value={form.no_hp}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
          <textarea
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/warga/profile')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
