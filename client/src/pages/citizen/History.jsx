import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/StatusBadge';

const TABS = [
  { key: 'surat', label: 'Surat' },
  { key: 'antrian', label: 'Antrian' },
  { key: 'pengaduan', label: 'Pengaduan' },
];

export default function History() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('surat');

  useEffect(() => {
    api.get('/warga/submissions/history')
      .then((res) => setData(res.data))
      .catch((err) => {
        const msg = err.response?.data?.message || 'Gagal memuat riwayat';
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

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Tidak ada data.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Riwayat Pengajuan</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {tab.label} ({data[tab.key]?.length || 0})
          </button>
        ))}
      </div>

      {activeTab === 'surat' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {data.surat?.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Belum ada data surat.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">ID</th>
                    <th className="text-left px-4 py-3 font-medium">Jenis Layanan</th>
                    <th className="text-left px-4 py-3 font-medium">Keperluan</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Catatan Admin</th>
                    <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                    <th className="text-left px-4 py-3 font-medium">Berkas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.surat.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                      <td className="px-4 py-3">{item.jenis_layanan}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate">{item.keperluan}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{item.catatan_admin || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{item.tanggal_pengajuan ? new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="px-4 py-3">
                        {item.berkas?.length > 0 ? (
                          <a
                            href={item.berkas[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Download
                          </a>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'antrian' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {data.antrian?.length === 0 ? (
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
                  {data.antrian.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                      <td className="px-4 py-3 text-xs">{item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="px-4 py-3">{item.jenis_layanan}</td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">{item.nomor_antrian || '-'}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pengaduan' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {data.pengaduan?.length === 0 ? (
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
                  {data.pengaduan.map((item) => (
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
