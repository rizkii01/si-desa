const LETTER_SCHEMAS = {
  SKD: {
    label: 'Surat Keterangan Domisili',
    kode: 'SKD',
    fields: [
      { key: 'tujuan_domisili', label: 'Tujuan Domisili', type: 'text', required: true },
      { key: 'lama_tinggal', label: 'Lama Tinggal', type: 'text', required: true, placeholder: 'contoh: 5 tahun' },
      { key: 'keperluan', label: 'Keperluan Pengajuan', type: 'textarea', required: true },
    ],
    berkasRequired: ['KTP', 'Kartu Keluarga'],
    berkasOptional: [],
  },
  SP: {
    label: 'Surat Pindah',
    kode: 'SP',
    fields: [
      { key: 'arah_pindah', label: 'Arah Pindah', type: 'select', required: true, options: ['Datang', 'Keluar'] },
      { key: 'alamat_asal', label: 'Alamat Asal', type: 'textarea', required: true },
      { key: 'alamat_tujuan', label: 'Alamat Tujuan', type: 'textarea', required: true },
      { key: 'alasan_pindah', label: 'Alasan Pindah', type: 'textarea', required: true },
      { key: 'anggota_ikut', label: 'Anggota Keluarga yang Ikut Pindah', type: 'textarea', required: false, placeholder: 'Nama-nama anggota keluarga, atau kosongkan jika tidak ada' },
    ],
    berkasRequired: ['KTP', 'Kartu Keluarga', 'Surat Pengantar RT'],
    berkasOptional: [],
  },
  SKK: {
    label: 'Surat Keterangan Kelahiran/Kematian',
    kode: 'SKK',
    fields: [
      { key: 'sub_jenis', label: 'Jenis Keterangan', type: 'select', required: true, options: ['Kelahiran', 'Kematian'] },
      // Kelahiran fields (shown when sub_jenis === 'Kelahiran')
      { key: 'nama_bayi', label: 'Nama Bayi', type: 'text', required: false, showWhen: { field: 'sub_jenis', value: 'Kelahiran' } },
      { key: 'tanggal_lahir_bayi', label: 'Tanggal Lahir', type: 'date', required: false, showWhen: { field: 'sub_jenis', value: 'Kelahiran' } },
      { key: 'tempat_lahir_bayi', label: 'Tempat Lahir', type: 'text', required: false, showWhen: { field: 'sub_jenis', value: 'Kelahiran' } },
      { key: 'jenis_kelamin_bayi', label: 'Jenis Kelamin Bayi', type: 'select', required: false, options: ['Laki-laki', 'Perempuan'], showWhen: { field: 'sub_jenis', value: 'Kelahiran' } },
      { key: 'nama_ayah', label: 'Nama Ayah', type: 'text', required: false, showWhen: { field: 'sub_jenis', value: 'Kelahiran' } },
      { key: 'nama_ibu', label: 'Nama Ibu', type: 'text', required: false, showWhen: { field: 'sub_jenis', value: 'Kelahiran' } },
      { key: 'nama_saksi', label: 'Nama Saksi', type: 'text', required: false, showWhen: { field: 'sub_jenis', value: 'Kelahiran' } },
      // Kematian fields (shown when sub_jenis === 'Kematian')
      { key: 'nama_almarhum', label: 'Nama Almarhum/ah', type: 'text', required: false, showWhen: { field: 'sub_jenis', value: 'Kematian' } },
      { key: 'tanggal_meninggal', label: 'Tanggal Meninggal', type: 'date', required: false, showWhen: { field: 'sub_jenis', value: 'Kematian' } },
      { key: 'tempat_meninggal', label: 'Tempat Meninggal', type: 'text', required: false, showWhen: { field: 'sub_jenis', value: 'Kematian' } },
      { key: 'penyebab_kematian', label: 'Penyebab Kematian', type: 'text', required: false, showWhen: { field: 'sub_jenis', value: 'Kematian' } },
      { key: 'hubungan_pelapor', label: 'Hubungan Pelapor', type: 'text', required: false, showWhen: { field: 'sub_jenis', value: 'Kematian' } },
    ],
    berkasRequired: ['KTP', 'Kartu Keluarga'],
    berkasOptional: ['Surat Keterangan Dokter/RS (kematian)'],
  },
  SKTM: {
    label: 'Surat Keterangan Tidak Mampu',
    kode: 'SKTM',
    fields: [
      { key: 'penghasilan_per_bulan', label: 'Penghasilan per Bulan (Rp)', type: 'number', required: true },
      { key: 'jumlah_tanggungan', label: 'Jumlah Tanggungan', type: 'number', required: true },
      { key: 'keperluan_sktm', label: 'Keperluan SKTM', type: 'select', required: true, options: ['Beasiswa', 'Keringanan Tagihan', 'Bantuan Sosial', 'Lainnya'] },
      { key: 'keterangan_ekonomi', label: 'Keterangan Kondisi Ekonomi', type: 'textarea', required: true },
    ],
    berkasRequired: ['KTP', 'Kartu Keluarga', 'Surat Pengantar RT'],
    berkasOptional: [],
  },
  SKU: {
    label: 'Surat Keterangan Usaha',
    kode: 'SKU',
    fields: [
      { key: 'nama_usaha', label: 'Nama Usaha', type: 'text', required: true },
      { key: 'jenis_usaha', label: 'Jenis Usaha', type: 'text', required: true },
      { key: 'alamat_usaha', label: 'Alamat Usaha', type: 'textarea', required: true },
      { key: 'omzet_per_bulan', label: 'Perkiraan Omzet/Bulan (Rp)', type: 'number', required: true },
    ],
    berkasRequired: ['KTP', 'Foto Tempat Usaha'],
    berkasOptional: [],
  },
  SPN: {
    label: 'Surat Pengantar Nikah',
    kode: 'SPN',
    fields: [
      { key: 'nama_calon_pasangan', label: 'Nama Calon Pasangan', type: 'text', required: true },
      { key: 'tanggal_rencana_nikah', label: 'Tanggal Rencana Pernikahan', type: 'date', required: true },
      { key: 'tempat_rencana_nikah', label: 'Tempat Rencana Pernikahan', type: 'text', required: true },
      { key: 'nama_wali', label: 'Nama Wali', type: 'text', required: true },
      { key: 'no_akta_cerai', label: 'No. Akta Cerai/Kematian Pasangan Sebelumnya', type: 'text', required: false, placeholder: 'Kosongkan jika tidak ada' },
    ],
    berkasRequired: ['KTP Pemohon', 'Kartu Keluarga'],
    berkasOptional: ['Akta Cerai/Kematian (jika ada)'],
  },
  SPORADIK: {
    label: 'Surat Sporadik / Riwayat Tanah',
    kode: 'SPORADIK',
    fields: [
      { key: 'lokasi_tanah', label: 'Lokasi Tanah', type: 'textarea', required: true },
      { key: 'luas_tanah', label: 'Luas Tanah (m²)', type: 'number', required: true },
      { key: 'batas_utara', label: 'Batas Utara', type: 'text', required: true },
      { key: 'batas_selatan', label: 'Batas Selatan', type: 'text', required: true },
      { key: 'batas_timur', label: 'Batas Timur', type: 'text', required: true },
      { key: 'batas_barat', label: 'Batas Barat', type: 'text', required: true },
      { key: 'keperluan', label: 'Keperluan Surat Sporadik', type: 'textarea', required: true },
    ],
    berkasRequired: ['KTP'],
    berkasOptional: ['Dokumen Kepemilikan Tanah Sebelumnya'],
  },
};

module.exports = { LETTER_SCHEMAS };
