import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';

const TABS = [
  { key: 'aktivitas', label: 'Riwayat Aktivitas' },
  { key: 'antrian', label: 'Antrian' },
  { key: 'pengaduan', label: 'Pengaduan' },
];

const ACTIVITY_ICONS = {
  queue_submitted: { icon: '🎫', color: 'text-blue-600 bg-blue-50' },
  queue_updated: { icon: '✅', color: 'text-green-600 bg-green-50' },
  complaint_submitted: { icon: '📢', color: 'text-orange-600 bg-orange-50' },
  complaint_replied: { icon: '💬', color: 'text-purple-600 bg-purple-50' },
  complaint_status_updated: { icon: '🔄', color: 'text-gray-600 bg-gray-50' },
  letter_submitted: { icon: '📄', color: 'text-blue-600 bg-blue-50' },
  letter_approved: { icon: '✅', color: 'text-green-600 bg-green-50' },
  letter_rejected: { icon: '❌', color: 'text-red-600 bg-red-50' },
  profile_updated: { icon: '👤', color: 'text-gray-600 bg-gray-50' },
  password_changed: { icon: '🔒', color: 'text-yellow-600 bg-yellow-50' },
};

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function groupByDate(items) {
  const groups = {};
  items.forEach((item) => {
    const d = new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!groups[d]) groups[d] = [];
    groups[d].push(item);
  });
  return groups;
}

export default function History() {
  const [tabData, setTabData] = useState({ antrian: [], pengaduan: [] });
  const [activities, setActivities] = useState([]);
  const [actPagination, setActPagination] = useState(null);
  const [actPage, setActPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('aktivitas');

  useEffect(() => {
    if (activeTab === 'aktivitas') {
      fetchActivities(actPage);
    }
  }, [activeTab, actPage]);

  useEffect(() => {
    api.get('/warga/submissions/history')
      .then((res) => setTabData(res.data))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Gagal memuat riwayat';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  async function fetchActivities(page) {
    try {
      setLoading(true);
      const res = await api.get(`/warga/activity-history?page=${page}&limit=30`);
      setActivities(res.data.data);
      setActPagination(res.data.pagination);
    } catch {
      toast.error('Gagal memuat riwayat aktivitas');
    } finally {
      setLoading(false);
    }
  }

  if (loading && activeTab !== 'aktivitas') {
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Aktivitas</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Aktivitas Tab */}
      {activeTab === 'aktivitas' && (
        <div>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : activities.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border text-center py-10">
              <p className="text-gray-500">Belum ada riwayat aktivitas.</p>
            </div>
          ) : (
            <>
              {Object.entries(groupByDate(activities)).map(([date, items]) => (
                <div key={date} className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{date}</h3>
                  <div className="space-y-2">
                    {items.map((a) => {
                      const style = ACTIVITY_ICONS[a.action] || { icon: '📋', color: 'text-gray-600 bg-gray-50' };
                      return (
                        <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 ${style.color}`}>
                            {style.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">{a.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{getTimeAgo(a.created_at)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {actPagination && actPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setActPage((p) => Math.max(1, p - 1))}
                    disabled={actPage <= 1}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    &larr; Sebelumnya
                  </button>
                  <span className="text-sm text-gray-500">Hal {actPage} dari {actPagination.totalPages}</span>
                  <button
                    onClick={() => setActPage((p) => Math.min(actPagination.totalPages, p + 1))}
                    disabled={actPage >= actPagination.totalPages}
                    className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Selanjutnya &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Antrian Tab */}
      {activeTab === 'antrian' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {tabData.antrian?.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Belum ada data antrian.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">ID</th>
                    <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                    <th className="text-left px-4 py-3 font-medium">Jenis Layanan</th>
                    <th className="text-left px-4 py-3 font-medium">No. Antrian</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tabData.antrian.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                      <td className="px-4 py-3 text-xs">{item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="px-4 py-3">{item.jenis_layanan}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">{item.nomor_antrian ?? '-'}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pengaduan Tab */}
      {activeTab === 'pengaduan' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {tabData.pengaduan?.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Belum ada data pengaduan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">ID</th>
                    <th className="text-left px-4 py-3 font-medium">Nama</th>
                    <th className="text-left px-4 py-3 font-medium">Isi Aduan</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Balasan Admin</th>
                    <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tabData.pengaduan.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                      <td className="px-4 py-3">{item.nama_lengkap}</td>
                      <td className="px-4 py-3 max-w-[250px] truncate">{item.isi_aduan}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{item.balasan_admin || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{item.tanggal_pengaduan ? new Date(item.tanggal_pengaduan).toLocaleDateString('id-ID') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
