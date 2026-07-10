import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonTable } from '../../components/Skeleton';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ManageSmartLetters() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchLetters(page);
  }, [page]);

  async function fetchLetters(p) {
    try {
      setLoading(true);
      const res = await api.get(`/admin/smart-letters?page=${p}&limit=20`);
      setLetters(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Gagal memuat smart letters');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengajuan Smart Letter</h1>
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  const tableSection = letters.length === 0 ? (
    <div className="text-center py-20 text-gray-500">Belum ada smart letter.</div>
  ) : (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 font-medium">No</th>
            <th className="px-4 py-3 font-medium">NIK</th>
            <th className="px-4 py-3 font-medium">Nama</th>
            <th className="px-4 py-3 font-medium">Jenis Surat</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">PDF</th>
            <th className="px-4 py-3 font-medium">Tanggal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {letters.map((l, i) => (
            <tr
              key={l.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => window.location.href = `/admin/smart-letters/${l.id}`}
            >
              <td className="px-4 py-3">{(page - 1) * 20 + i + 1}</td>
              <td className="px-4 py-3">{l.nik}</td>
              <td className="px-4 py-3">{l.nama_lengkap}</td>
              <td className="px-4 py-3">{l.jenis_surat}</td>
              <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
              <td className="px-4 py-3">
                {l.generated_file_path ? (
                  <a href={`${API_BASE}${l.generated_file_path}`} target="_blank" rel="noopener noreferrer"
                    className="text-green-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                    Download PDF
                  </a>
                ) : '-'}
              </td>
              <td className="px-4 py-3">
                {l.tanggal_pengajuan ? new Date(l.tanggal_pengajuan).toLocaleDateString('id-ID') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const pages = pagination && pagination.totalPages > 1 ? Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
    .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pagination.totalPages) : [];

  const paginationSection = pagination && pagination.totalPages > 1 ? (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
        className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
        &larr; Sebelumnya
      </button>
      {pages.map((p, idx, arr) => (
        <span key={p} className="flex items-center gap-1">
          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-gray-400 px-1">...</span>}
          <button onClick={() => setPage(p)}
            className={"px-3 py-1.5 text-sm rounded-lg border" + (page === p ? " bg-blue-600 text-white border-blue-600" : " hover:bg-gray-50")}>
            {p}
          </button>
        </span>
      ))}
      <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
        className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">
        Selanjutnya &rarr;
      </button>
    </div>
  ) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengajuan Smart Letter</h1>
      {tableSection}
      {paginationSection}
    </div>
  );
}
