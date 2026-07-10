import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard")
      .then((res) => setData(res.data))
      .catch(() => toast.error("Gagal memuat dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20 text-gray-500">Tidak ada data dashboard.</div>;
  }

  const cards = [
    { label: "Total Warga", value: data.total_warga, color: "bg-blue-500" },
    { label: "Surat Pintar Pending", value: data.smart_letter_pending ?? 0, color: "bg-teal-500" },
    { label: "Antrian Pending", value: data.antrian_pending ?? 0, color: "bg-purple-500" },
    { label: "Pengaduan Aktif", value: data.pengaduan_aktif ?? 0, color: "bg-red-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className={`${card.color} rounded-xl shadow-sm p-6 text-white`}>
            <p className="text-sm opacity-80">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
