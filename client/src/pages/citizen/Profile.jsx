import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { displayName } from '../../utils/formatters';

function calculateAge(tanggalLahir) {
  if (!tanggalLahir) return '-';
  const birth = new Date(tanggalLahir);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/warga/profile')
      .then((res) => setProfile(res.data))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Gagal memuat profil';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Data profil tidak tersedia.</p>
      </div>
    );
  }

  const fields = [
    { label: 'NIK', value: profile.nik },
    { label: 'Nama', value: displayName(profile) },
    { label: 'Email', value: profile.email || '-' },
    { label: 'No HP', value: profile.no_hp || '-' },
    { label: 'Tempat Lahir', value: profile.tempat_lahir || '-' },
    { label: 'Tanggal Lahir', value: profile.tanggal_lahir || '-' },
    { label: 'Usia', value: `${calculateAge(profile.tanggal_lahir)} tahun` },
    { label: 'Jenis Kelamin', value: profile.jenis_kelamin || '-' },
    { label: 'Alamat', value: profile.alamat || '-' },
  ];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <Link
          to="/warga/edit-profile"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          Edit Profil
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-6 mb-6 pb-6 border-b">
          {profile.foto_profil ? (
            <img
              src={profile.foto_profil}
              alt="foto profil"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl text-blue-600 font-bold border-2 border-gray-200">
              {displayName(profile).charAt(0) || '?'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{displayName(profile)}</h2>
            <p className="text-sm text-gray-500">NIK: {profile.nik}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label}>
              <span className="text-sm text-gray-500">{f.label}</span>
              <p className="text-gray-900 font-medium">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
