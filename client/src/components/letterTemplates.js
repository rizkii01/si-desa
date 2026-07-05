const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

function toRoman(m) {
  return ROMAN[m] || m;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function baseStyle() {
  return `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Times New Roman', Times, serif; font-size: 12pt;
             color: #000; background: #fff; padding: 2cm; }
      .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 16px; }
      .kop h1 { font-size: 16pt; font-weight: bold; text-transform: uppercase; }
      .kop h2 { font-size: 13pt; font-weight: bold; }
      .kop p  { font-size: 10pt; }
      .judul  { text-align: center; font-size: 13pt; font-weight: bold;
                text-decoration: underline; margin: 20px 0 16px; }
      .nomor  { text-align: center; font-size: 11pt; margin-bottom: 20px; }
      .pembuka { margin-bottom: 12px; }
      table.data { width: 100%; border-collapse: collapse; margin: 12px 0; }
      table.data td { padding: 3px 8px 3px 0; vertical-align: top; }
      table.data td:first-child { width: 40%; }
      table.data td:nth-child(2) { width: 4%; }
      .penutup { margin-top: 16px; text-align: justify; }
      .ttd { margin-top: 40px; text-align: right; }
      .ttd .nama { margin-top: 60px; font-weight: bold; text-decoration: underline; }
      .ttd .jabatan { font-style: italic; }
      @media print {
        body { padding: 1.5cm; }
        @page { size: A4; margin: 2cm; }
      }
    </style>`;
}

function kop() {
  return `
    <div class="kop">
      <h1>Pemerintah Desa Cemara</h1>
      <h2>Kantor Kepala Desa</h2>
      <p>Jl. Cemara No. 1, Kec. Cemara, Kab. Cemara | Telp: (021) 000-0000</p>
    </div>`;
}

function ttd(tanggal) {
  const tgl = tanggal ? formatDate(tanggal) : formatDate(new Date().toISOString());
  return `
    <div class="ttd">
      <p>Cemara, ${tgl}</p>
      <p class="jabatan">Kepala Desa Cemara</p>
      <div class="nama">( __________________________ )</div>
      <p class="jabatan">NIP. ______________________</p>
    </div>`;
}

function nomorSurat(sub) {
  return sub.nomor_surat || `____/${sub.jenis_surat}/____/____`;
}

function bodySKD(sub) {
  const d = sub.form_data;
  return `
    <div class="pembuka">Yang bertanda tangan di bawah ini, Kepala Desa Cemara, menerangkan bahwa:</div>
    <table class="data">
      <tr><td>Nama Lengkap</td><td>:</td><td>${sub.nama_lengkap}</td></tr>
      <tr><td>NIK</td><td>:</td><td>${sub.nik}</td></tr>
      <tr><td>Tujuan Domisili</td><td>:</td><td>${d.tujuan_domisili}</td></tr>
      <tr><td>Lama Tinggal</td><td>:</td><td>${d.lama_tinggal}</td></tr>
      <tr><td>Keperluan</td><td>:</td><td>${d.keperluan}</td></tr>
    </table>
    <div class="penutup">Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</div>`;
}

function bodySP(sub) {
  const d = sub.form_data;
  return `
    <div class="pembuka">Yang bertanda tangan di bawah ini, Kepala Desa Cemara, menerangkan bahwa:</div>
    <table class="data">
      <tr><td>Nama Lengkap</td><td>:</td><td>${sub.nama_lengkap}</td></tr>
      <tr><td>NIK</td><td>:</td><td>${sub.nik}</td></tr>
      <tr><td>Arah Pindah</td><td>:</td><td>${d.arah_pindah}</td></tr>
      <tr><td>Alamat Asal</td><td>:</td><td>${d.alamat_asal}</td></tr>
      <tr><td>Alamat Tujuan</td><td>:</td><td>${d.alamat_tujuan}</td></tr>
      <tr><td>Alasan Pindah</td><td>:</td><td>${d.alasan_pindah}</td></tr>
      ${d.anggota_ikut ? `<tr><td>Anggota Ikut Pindah</td><td>:</td><td>${d.anggota_ikut}</td></tr>` : ''}
    </table>
    <div class="penutup">Demikian surat pindah ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</div>`;
}

function bodySKK(sub) {
  const d = sub.form_data;
  if (d.sub_jenis === 'Kelahiran') {
    return `
      <div class="pembuka">Yang bertanda tangan di bawah ini menerangkan bahwa telah lahir seorang anak:</div>
      <table class="data">
        <tr><td>Nama Bayi</td><td>:</td><td>${d.nama_bayi}</td></tr>
        <tr><td>Jenis Kelamin</td><td>:</td><td>${d.jenis_kelamin_bayi}</td></tr>
        <tr><td>Tanggal Lahir</td><td>:</td><td>${formatDate(d.tanggal_lahir_bayi)}</td></tr>
        <tr><td>Tempat Lahir</td><td>:</td><td>${d.tempat_lahir_bayi}</td></tr>
        <tr><td>Nama Ayah</td><td>:</td><td>${d.nama_ayah}</td></tr>
        <tr><td>Nama Ibu</td><td>:</td><td>${d.nama_ibu}</td></tr>
        <tr><td>Nama Saksi</td><td>:</td><td>${d.nama_saksi}</td></tr>
      </table>
      <div class="penutup">Surat keterangan kelahiran ini diberikan atas permintaan orang tua yang bersangkutan.</div>`;
  }
  return `
    <div class="pembuka">Yang bertanda tangan di bawah ini menerangkan bahwa telah meninggal dunia:</div>
    <table class="data">
      <tr><td>Nama</td><td>:</td><td>${d.nama_almarhum}</td></tr>
      <tr><td>Tanggal Meninggal</td><td>:</td><td>${formatDate(d.tanggal_meninggal)}</td></tr>
      <tr><td>Tempat Meninggal</td><td>:</td><td>${d.tempat_meninggal}</td></tr>
      <tr><td>Penyebab Kematian</td><td>:</td><td>${d.penyebab_kematian}</td></tr>
      <tr><td>Hubungan Pelapor</td><td>:</td><td>${d.hubungan_pelapor}</td></tr>
    </table>
    <div class="penutup">Surat keterangan kematian ini dibuat berdasarkan laporan dari pihak keluarga yang bersangkutan.</div>`;
}

function bodySKTM(sub) {
  const d = sub.form_data;
  return `
    <div class="pembuka">Yang bertanda tangan di bawah ini menerangkan bahwa:</div>
    <table class="data">
      <tr><td>Nama Lengkap</td><td>:</td><td>${sub.nama_lengkap}</td></tr>
      <tr><td>NIK</td><td>:</td><td>${sub.nik}</td></tr>
      <tr><td>Penghasilan/Bulan</td><td>:</td><td>Rp ${Number(d.penghasilan_per_bulan).toLocaleString('id-ID')}</td></tr>
      <tr><td>Jumlah Tanggungan</td><td>:</td><td>${d.jumlah_tanggungan} orang</td></tr>
      <tr><td>Keperluan</td><td>:</td><td>${d.keperluan_sktm}</td></tr>
      <tr><td>Keterangan</td><td>:</td><td>${d.keterangan_ekonomi}</td></tr>
    </table>
    <div class="penutup">Berdasarkan keterangan di atas, yang bersangkutan benar-benar termasuk warga tidak mampu di wilayah Desa Cemara.</div>`;
}

function bodySKU(sub) {
  const d = sub.form_data;
  return `
    <div class="pembuka">Yang bertanda tangan di bawah ini menerangkan bahwa:</div>
    <table class="data">
      <tr><td>Nama Lengkap</td><td>:</td><td>${sub.nama_lengkap}</td></tr>
      <tr><td>NIK</td><td>:</td><td>${sub.nik}</td></tr>
      <tr><td>Nama Usaha</td><td>:</td><td>${d.nama_usaha}</td></tr>
      <tr><td>Jenis Usaha</td><td>:</td><td>${d.jenis_usaha}</td></tr>
      <tr><td>Alamat Usaha</td><td>:</td><td>${d.alamat_usaha}</td></tr>
      <tr><td>Perkiraan Omzet/Bulan</td><td>:</td><td>Rp ${Number(d.omzet_per_bulan).toLocaleString('id-ID')}</td></tr>
    </table>
    <div class="penutup">Surat keterangan usaha ini diberikan untuk mendukung keperluan administrasi yang bersangkutan.</div>`;
}

function bodySPN(sub) {
  const d = sub.form_data;
  return `
    <div class="pembuka">Yang bertanda tangan di bawah ini menerangkan bahwa:</div>
    <table class="data">
      <tr><td>Nama Pemohon</td><td>:</td><td>${sub.nama_lengkap}</td></tr>
      <tr><td>NIK</td><td>:</td><td>${sub.nik}</td></tr>
      <tr><td>Nama Calon Pasangan</td><td>:</td><td>${d.nama_calon_pasangan}</td></tr>
      <tr><td>Tanggal Rencana Nikah</td><td>:</td><td>${formatDate(d.tanggal_rencana_nikah)}</td></tr>
      <tr><td>Tempat Rencana Nikah</td><td>:</td><td>${d.tempat_rencana_nikah}</td></tr>
      <tr><td>Nama Wali</td><td>:</td><td>${d.nama_wali}</td></tr>
      ${d.no_akta_cerai ? `<tr><td>No. Akta Cerai/Kematian</td><td>:</td><td>${d.no_akta_cerai}</td></tr>` : ''}
    </table>
    <div class="penutup">Surat pengantar nikah ini dibuat atas permintaan yang bersangkutan untuk digunakan sebagaimana mestinya.</div>`;
}

function bodySPORADIK(sub) {
  const d = sub.form_data;
  return `
    <div class="pembuka">Yang bertanda tangan di bawah ini menerangkan bahwa tanah yang berlokasi sebagai berikut:</div>
    <table class="data">
      <tr><td>Pemohon</td><td>:</td><td>${sub.nama_lengkap}</td></tr>
      <tr><td>NIK</td><td>:</td><td>${sub.nik}</td></tr>
      <tr><td>Lokasi Tanah</td><td>:</td><td>${d.lokasi_tanah}</td></tr>
      <tr><td>Luas Tanah</td><td>:</td><td>${d.luas_tanah} m²</td></tr>
      <tr><td>Batas Utara</td><td>:</td><td>${d.batas_utara}</td></tr>
      <tr><td>Batas Selatan</td><td>:</td><td>${d.batas_selatan}</td></tr>
      <tr><td>Batas Timur</td><td>:</td><td>${d.batas_timur}</td></tr>
      <tr><td>Batas Barat</td><td>:</td><td>${d.batas_barat}</td></tr>
      <tr><td>Keperluan</td><td>:</td><td>${d.keperluan}</td></tr>
    </table>
    <div class="penutup">Demikian surat sporadik ini dibuat dengan sebenarnya dan dapat dipertanggungjawabkan.</div>`;
}

const BODY_RENDERERS = {
  SKD: bodySKD,
  SP: bodySP,
  SKK: bodySKK,
  SKTM: bodySKTM,
  SKU: bodySKU,
  SPN: bodySPN,
  SPORADIK: bodySPORADIK
};

export function renderLetterHTML(submission) {
  const bodyFn = BODY_RENDERERS[submission.jenis_surat];
  const body = bodyFn ? bodyFn(submission) : '<p>Jenis surat tidak dikenali.</p>';
  const LABEL = {
    SKD: 'SURAT KETERANGAN DOMISILI',
    SP: 'SURAT PINDAH',
    SKK: `SURAT KETERANGAN ${submission.form_data?.sub_jenis?.toUpperCase() || 'KELAHIRAN/KEMATIAN'}`,
    SKTM: 'SURAT KETERANGAN TIDAK MAMPU',
    SKU: 'SURAT KETERANGAN USAHA',
    SPN: 'SURAT PENGANTAR NIKAH',
    SPORADIK: 'SURAT SPORADIK / RIWAYAT TANAH'
  };

  return `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">
    <title>${LABEL[submission.jenis_surat] || 'Surat'}</title>
    ${baseStyle()}
    </head><body>
    ${kop()}
    <div class="judul">${LABEL[submission.jenis_surat] || 'SURAT KETERANGAN'}</div>
    <div class="nomor">Nomor: ${nomorSurat(submission)}</div>
    ${body}
    ${ttd(submission.tanggal_disetujui)}
    </body></html>`;
}
