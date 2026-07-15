import { useState } from 'react';

function renderHeader() {
  return `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1d4ed8; padding-bottom: 20px;">
      <h1 style="margin: 0; font-size: 22px; font-weight: bold; color: #1d4ed8;">PEMERINTAH KABUPATEN...</h1>
      <h2 style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">KECAMATAN...</h2>
      <h3 style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">DESA CEMARA</h3>
      <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">Jl. ... No. ... Telp. ... Kode Pos ...</p>
    </div>
  `;
}

function renderQueueInfo(queue) {
  const statusColor = {
    'Pending': '#f59e0b',
    'Diproses': '#3b82f6',
    'Selesai': '#10b981',
    'Dibatalkan': '#ef4444',
  }[queue.status] || '#6b7280';

  const tanggalFormatted = new Date(queue.tanggal + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return `
    <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; border: 2px solid #22c55e; margin-bottom: 20px; text-align: center;">
      <p style="margin: 0; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Nomor Antrian Anda</p>
      <p style="margin: 8px 0; font-size: 64px; font-weight: 900; color: #15803d; line-height: 1;">${queue.nomor_antrian}</p>
    </div>
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #374151;">DETAIL ANTRIAN</h4>
      <table style="width: 100%; font-size: 13px;">
        <tr>
          <td style="width: 150px; vertical-align: top; padding: 4px 0;">ID Antrian</td>
          <td style="padding: 4px 0;">:</td>
          <td style="padding: 4px 0; font-family: monospace;">#${queue.id}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">Tanggal</td>
          <td style="padding: 4px 0;">:</td>
          <td style="padding: 4px 0;">${tanggalFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">Jenis Layanan</td>
          <td style="padding: 4px 0;">:</td>
          <td style="padding: 4px 0;">${queue.jenis_layanan}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">Status</td>
          <td style="padding: 4px 0;">:</td>
          <td style="padding: 4px 0;">
            <span style="display: inline-block; padding: 2px 10px; background: ${statusColor}; color: white; border-radius: 4px; font-size: 12px; font-weight: 600;">
              ${queue.status}
            </span>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function renderApplicantData(queue) {
  return `
    <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
      <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #1e40af;">DATA PEMOHON</h4>
      <table style="width: 100%; font-size: 13px;">
        <tr>
          <td style="width: 150px; padding: 4px 0;">Nama Lengkap</td>
          <td style="padding: 4px 0;">:</td>
          <td style="padding: 4px 0;">${queue.nama_lengkap}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">NIK</td>
          <td style="padding: 4px 0;">:</td>
          <td style="padding: 4px 0; font-family: monospace;">${queue.nik}</td>
        </tr>
      </table>
    </div>
  `;
}

function renderFooter() {
  return `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; text-align: center; font-size: 12px; color: #6b7280;">
      <p>Harap tunjukkan invoice ini kepada petugas di loket pelayanan desa.</p>
      <p style="margin-top: 5px;">Simpan atau cetak invoice ini sebagai bukti pengambilan antrian.</p>
      <p style="margin-top: 8px; font-weight: 600; color: #374151;">DESA CEMARA — Portal Warga</p>
    </div>
  `;
}

export function renderQueueInvoiceHTML(queue) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice Antrian #${queue.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          padding: 40px 50px;
          background: white;
          color: #1f2937;
        }
        .invoice { max-width: 500px; margin: 0 auto; }
        table { border-collapse: collapse; }
        @media print {
          @page { size: A5; margin: 12mm; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        ${renderHeader()}
        ${renderQueueInfo(queue)}
        ${renderApplicantData(queue)}
        ${renderFooter()}
      </div>
    </body>
    </html>
  `;
}

export default function QueueInvoice({ queue, onClose }) {
  const [showPrint, setShowPrint] = useState(false);

  const handlePrint = () => setShowPrint(true);

  if (typeof document !== 'undefined') {
    if (!document.getElementById('queue-invoice-print-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'queue-invoice-print-styles';
      styleEl.textContent = `
        @media print {
          body * { visibility: hidden; }
          #queue-invoice-frame, #queue-invoice-frame * { visibility: visible; }
          #queue-invoice-frame {
            position: absolute; left: 0; top: 0;
            width: 100%; height: 100%;
            border: none; margin: 0; padding: 0;
          }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }

  const invoiceHTML = renderQueueInvoiceHTML(queue);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bukti Pengambilan Antrian</h3>
            <p className="text-sm text-gray-500 mt-1">Antrian #{queue.id} — Nomor <span className="font-mono font-bold text-green-700">{queue.nomor_antrian}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Cetak
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <iframe
            srcDoc={invoiceHTML}
            title="Invoice Antrian"
            className="w-full h-[500px] border-0 rounded-lg shadow-sm"
            sandbox="allow-same-origin"
          />
        </div>
      </div>

      {showPrint && (
        <iframe
          srcDoc={invoiceHTML}
          title="Print Invoice Antrian"
          className="fixed inset-0 w-full h-full z-[100] hidden"
          id="queue-invoice-frame"
          onLoad={() => {
            setTimeout(() => {
              window.print();
              setShowPrint(false);
            }, 100);
          }}
        />
      )}
    </div>
  );
}
