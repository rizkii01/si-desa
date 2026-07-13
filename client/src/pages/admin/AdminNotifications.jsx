import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  async function fetchNotifications() {
    try {
      const res = await api.get("/admin/notifications");
      setList(res.data);
    } catch {
      toast.error("Gagal memuat notifikasi");
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    try {
      await api.put(`/admin/notifications/${id}/read`);
      setList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      toast.error("Gagal menandai notifikasi");
    }
  }

  async function markAllAsRead() {
    try {
      await api.put("/admin/notifications/read-all");
      setList((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("Semua notifikasi ditandai dibaca");
    } catch {
      toast.error("Gagal menandai semua notifikasi");
    }
  }

  function handleClick(n) {
    if (!n.is_read) markAsRead(n.id);
    if (n.submission_id && n.type === "new_submission") {
      navigate(`/admin/smart-letters/${n.submission_id}`);
    } else if (n.type === "new_queue") {
      navigate('/admin/queues');
    } else if (n.type === "new_complaint") {
      navigate('/admin/complaints');
    }
  }

  function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifikasi Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Pemberitahuan pengajuan baru dan lainnya</p>
        </div>
        {list.some((n) => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <div className="text-gray-400 text-5xl mb-4">&#128276;</div>
          <p className="text-gray-500">Belum ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left bg-white rounded-xl p-4 hover:shadow-md transition-shadow border ${
                n.is_read
                  ? "border-gray-100"
                  : "border-blue-200 bg-blue-50/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    n.is_read ? "bg-gray-300" : "bg-blue-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      n.is_read ? "text-gray-600" : "text-gray-900 font-semibold"
                    }`}
                  >
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {getTimeAgo(n.created_at)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
