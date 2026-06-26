export default function StatusBadge({ status }) {
  const colors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Diproses: 'bg-blue-100 text-blue-800',
    Selesai: 'bg-green-100 text-green-800',
    Ditolak: 'bg-red-100 text-red-800',
    Baru: 'bg-purple-100 text-purple-800',
    Terverifikasi: 'bg-cyan-100 text-cyan-800',
  };

  const color = colors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
}
