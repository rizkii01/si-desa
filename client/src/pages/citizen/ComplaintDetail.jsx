import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';

const STATUS_INFO = {
  'Baru': { color: 'bg-purple-50 border-purple-200 text-purple-800', label: 'Aduan Anda sedang menunggu peninjauan oleh admin.' },
  'Diproses': { color: 'bg-blue-50 border-blue-200 text-blue-800', label: 'Aduan Anda sedang diproses oleh admin.' },
  'Selesai': { color: 'bg-green-50 border-green-200 text-green-800', label: 'Aduan Anda telah selesai ditangani.' },
};

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/warga/submissions/complaints/${id}`)
      .then((res) => setComplaint(res.data))
      .catch(() => {
        toast.error('Pengaduan tidak ditemukan');
        navigate('/warga/history');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!complaint) return null;

  const statusInfo = STATUS_INFO[complaint.status] || STATUS_INFO['Baru'];

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/warga/history')}
        className="mb-5 text-sm text-gray-500 hover:text-blue-600"
      >
        &larr; Kembali ke Riwayat
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Detail Pengaduan</h1>
            <p className="text-sm text-gray-500 mt-1">No. {complaint.id}</p>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Status Info */}
        <div className={`border rounded-lg p-3 mb-5 text-sm ${statusInfo.color}`}>
          {statusInfo.label}
        </div>

        {/* Info Pengadu */}
        <div className="bg-gray-50 rounded-lg p-4 mb-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Nama Pengadu</p>
            <p className="font-medium text-gray-800">{complaint.nama_lengkap || '-'}</p>
          </div>
          <div>
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

        {/* Isi Aduan */}
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Isi Aduan</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {complaint.isi_aduan}
          </div>
        </div>

        {/* Balasan Admin */}
        {complaint.balasan_admin && (
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Balasan Admin</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
              {complaint.balasan_admin}
            </div>
          </div>
        )}

        {/* Belum ada balasan */}
        {!complaint.balasan_admin && complaint.status !== 'Selesai' && (
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Balasan Admin</h2>
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-400 text-center">
              Belum ada balasan dari admin
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
