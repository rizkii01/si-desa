import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import StatusBadge from "../../components/StatusBadge";
import { SkeletonCard } from "../../components/Skeleton";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function SmartLetterHistory() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchLetters(page); }, [page]);

  async function fetchLetters(p) {
    try {
      setLoading(true);
      const res = await api.get(`/warga/smart-letters?page=${p}&limit=20`);
      setLetters(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error("Gagal memuat riwayat smart letter");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDetail(id) {
    try {
      const res = await api.get(`/warga/smart-letters/${id}`);
      setSelected(res.data);
    } catch {
      toast.error("Gagal memuat detail");
    }
  }

  if (loading) {
    return <SkeletonCard count={5} />;
  }

  if (selected) {
    const fd = typeof selected.form_data === "string"
      ? JSON.parse(selected.form_data)
      : selected.form_data || {};

    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelected(null)}
          className="mb-5 text-sm text-gray-500 hover:text-blue-600"
        >
          &larr; Kembali ke Daftar
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{selected.jenis_surat}</h2>
              <p className="text-sm text-gray-500 mt-1">Ref: {selected.nomor_referensi}</p>
            </div>
            <StatusBadge status={selected.status} />
          </div>

          {selected.nomor_surat && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800">
              <strong>Nomor Surat:</strong> {selected.nomor_surat}
            </div>
          )}

          {selected.alasan_penolakan && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-800">
              <strong>Alasan Penolakan:</strong> {selected.alasan_penolakan}
            </div>
          )}

          <div className="space-y-3 mb-5">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Data Pengajuan</h3>
            {Object.entries(fd).map(([k, v]) => (
              <div key={k} className="flex gap-3 text-sm">
                <span className="font-medium text-gray-600 w-40 shrink-0 capitalize">{k.replace(/_/g, " ")}</span>
                <span className="text-gray-800">{v || "-"}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap text-sm text-gray-500 mb-4">
            <span>Diajukan: {selected.tanggal_pengajuan ? new Date(selected.tanggal_pengajuan).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</span>
          </div>

          {selected.generated_file_path && (
            <a
              href={`${API_BASE}${selected.generated_file_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              &#11015; Download PDF Surat
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Smart Letter</h1>
          <p className="text-gray-500 text-sm mt-1">Lihat status pengajuan smart letter Anda</p>
        </div>
        <a
          href="/warga/smart-submit-letter"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Ajukan Baru
        </a>
      </div>

      {letters.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <div className="text-gray-400 text-5xl mb-4">&#128196;</div>
          <p className="text-gray-500">Belum ada pengajuan smart letter</p>
          <a
            href="/warga/smart-submit-letter"
            className="mt-4 inline-block text-blue-600 hover:underline text-sm"
          >
            Ajukan sekarang &rarr;
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {letters.map((l) => (
              <button
                key={l.id}
                onClick={() => fetchDetail(l.id)}
                className="w-full text-left bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border border-transparent hover:border-blue-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{l.jenis_surat}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {l.nomor_referensi} &bull;{" "}
                      {l.tanggal_pengajuan
                        ? new Date(l.tanggal_pengajuan).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                        : "-"}
                    </p>
                    {l.nomor_surat && (
                      <p className="text-xs text-green-600 mt-1 font-medium">No. Surat: {l.nomor_surat}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={l.status} />
                    {l.generated_file_path && (
                      <span className="text-xs text-blue-600 font-medium">&#10004; PDF tersedia</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                &larr; Sebelumnya
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pagination.totalPages)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-1">
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-gray-400 px-1">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 text-sm rounded-lg border ${
                        page === p
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Selanjutnya &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
