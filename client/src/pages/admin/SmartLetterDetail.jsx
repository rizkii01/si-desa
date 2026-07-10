import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import StatusBadge from "../../components/StatusBadge";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SmartLetterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null); // "approve" | "reject"
  const [nomorSurat, setNomorSurat] = useState("");
  const [alasan, setAlasan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchDetail(); }, [id]);

  async function fetchDetail() {
    try {
      const res = await api.get(`/admin/smart-letters/${id}`);
      setLetter(res.data);
    } catch {
      toast.error("Gagal memuat detail");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(e) {
    e.preventDefault();
    if (!nomorSurat.trim()) return toast.error("Nomor surat wajib diisi");
    setSubmitting(true);
    try {
      await api.put(`/admin/smart-letters/${id}/approve`, { nomor_surat: nomorSurat });
      toast.success("Pengajuan disetujui & PDF dibuat");
      navigate("/admin/smart-letters");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menyetujui");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject(e) {
    e.preventDefault();
    if (!alasan.trim()) return toast.error("Alasan penolakan wajib diisi");
    setSubmitting(true);
    try {
      await api.put(`/admin/smart-letters/${id}/reject`, { alasan_penolakan: alasan });
      toast.success("Pengajuan ditolak");
      navigate("/admin/smart-letters");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal menolak");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!letter) {
    return <div className="p-6 text-red-600">Pengajuan tidak ditemukan.</div>;
  }

  const fd = typeof letter.form_data === "string"
    ? JSON.parse(letter.form_data)
    : letter.form_data || {};

  const canAct = letter.status === "Menunggu";

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/admin/smart-letters")}
        className="mb-5 text-sm text-gray-500 hover:text-blue-600"
      >
        &larr; Kembali
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{letter.jenis_surat}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Ref: {letter.nomor_referensi}
            </p>
          </div>
          <StatusBadge status={letter.status} />
        </div>

        {/* Pemohon info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Nama</p>
            <p className="font-medium text-gray-800">{letter.nama_lengkap || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">NIK</p>
            <p className="font-medium text-gray-800">{letter.nik || "-"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-0.5">Tanggal Pengajuan</p>
            <p className="font-medium text-gray-800">
              {letter.tanggal_pengajuan
                ? new Date(letter.tanggal_pengajuan).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
                : "-"}
            </p>
          </div>
          {letter.nomor_surat && (
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Nomor Surat</p>
              <p className="font-medium text-green-700">{letter.nomor_surat}</p>
            </div>
          )}
        </div>

        {/* Form data */}
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Data Pengajuan</h2>
          <div className="space-y-2">
            {Object.entries(fd).map(([k, v]) => (
              <div key={k} className="flex gap-3 text-sm">
                <span className="text-gray-500 w-44 shrink-0 capitalize">{k.replace(/_/g, " ")}</span>
                <span className="text-gray-800 font-medium">{v || "-"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Berkas */}
        {Array.isArray(letter.files) && letter.files.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Berkas Lampiran</h2>
            <div className="flex flex-wrap gap-2">
              {letter.files.map((b, i) => (
                <a
                  key={i}
                  href={`${API_BASE}${b.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                >
                  &#128206; {b.original_name || `Berkas ${i + 1}`}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* PDF */}
        {letter.generated_file_path && (
          <div className="mb-5">
            <a
              href={`${API_BASE}${letter.generated_file_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg hover:bg-green-100"
            >
              &#11015; Download PDF Surat
            </a>
          </div>
        )}

        {/* Rejection reason */}
        {letter.alasan_penolakan && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            <strong>Alasan Penolakan:</strong> {letter.alasan_penolakan}
          </div>
        )}

        {/* Action buttons */}
        {canAct && !action && (
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => setAction("approve")}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              &#10003; Setujui & Buat PDF
            </button>
            <button
              onClick={() => setAction("reject")}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              &#10007; Tolak
            </button>
          </div>
        )}

        {/* Approve form */}
        {canAct && action === "approve" && (
          <form onSubmit={handleApprove} className="pt-3 border-t border-gray-100 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Masukkan Nomor Surat</h3>
            <input
              type="text"
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              placeholder="contoh: 470/001/DS/VII/2025"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50"
              >
                {submitting ? "Memproses..." : "Konfirmasi Setujui"}
              </button>
              <button
                type="button"
                onClick={() => setAction(null)}
                className="px-4 text-sm text-gray-600 hover:text-gray-800"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {/* Reject form */}
        {canAct && action === "reject" && (
          <form onSubmit={handleReject} className="pt-3 border-t border-gray-100 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Alasan Penolakan</h3>
            <textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Jelaskan alasan penolakan..."
              required
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50"
              >
                {submitting ? "Memproses..." : "Konfirmasi Tolak"}
              </button>
              <button
                type="button"
                onClick={() => setAction(null)}
                className="px-4 text-sm text-gray-600 hover:text-gray-800"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
