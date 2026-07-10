import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useNavigate, useBlocker } from "react-router-dom";
import { LETTER_SCHEMAS } from "../../utils/letterSchemas";
import DynamicLetterForm from "../../components/DynamicLetterForm";

export default function SmartSubmitLetter() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const schema = selectedType ? LETTER_SCHEMAS[selectedType] : null;
  const hasFormData = Object.keys(formData).length > 0 || files.length > 0;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasFormData && currentLocation.pathname !== nextLocation.pathname
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

  function handleChange(fieldKey, value) {
    setFormData((prev) => ({ ...prev, [fieldKey]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("jenis_surat", selectedType);
      fd.append("form_data", JSON.stringify(formData));
      files.forEach((f) => fd.append("berkas", f));
      await api.post("/warga/smart-letters", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Pengajuan berhasil dikirim!");
      navigate("/warga/smart-letters");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Gagal mengirim pengajuan");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 1) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Ajukan Smart Letter</h1>
          <p className="text-gray-500 mt-1">Pilih jenis surat yang ingin diajukan</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(LETTER_SCHEMAS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => { setSelectedType(key); setFormData({}); setStep(2); }}
              className="text-left bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {key}
                </span>
              </div>
              <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{val.label}</p>
              <p className="text-xs text-gray-500 mt-1">Berkas: {val.berkasRequired.join(", ")}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => { setStep(1); setSelectedType(""); }}
          className="text-sm text-gray-500 hover:text-blue-600"
        >
          &larr; Kembali
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{schema.label}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Isi formulir dengan benar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <DynamicLetterForm
          schema={schema}
          values={formData}
          errors={{}}
          onChange={handleChange}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Berkas <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">Wajib: {schema.berkasRequired.join(", ")}</p>
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {files.length > 0 && (
            <ul className="mt-2 text-xs text-gray-600 space-y-1">
              {files.map((f, i) => <li key={i}>&#10003; {f.name}</li>)}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {submitting ? "Mengirim..." : "Kirim Pengajuan"}
        </button>
      </form>
    </div>
  );
}
