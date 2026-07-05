const { LETTER_SCHEMAS } = require('./letterSchemas');

/**
 * Validasi field wajib berdasarkan jenis surat dan sub_jenis (untuk SKK).
 * Returns array of error strings; kosong = valid.
 */
function validateSmartLetterFields(jenisSurat, formData) {
  const errors = [];
  const schema = LETTER_SCHEMAS[jenisSurat];
  if (!schema) {
    return [`Jenis surat '${jenisSurat}' tidak dikenal`];
  }

  for (const field of schema.fields) {
    // Skip conditional fields that don't apply
    if (field.showWhen) {
      if (formData[field.showWhen.field] !== field.showWhen.value) continue;
    }

    const isRequired = field.required ||
      (field.showWhen && formData[field.showWhen.field] === field.showWhen.value);

    if (isRequired) {
      const val = formData[field.key];
      if (val === undefined || val === null || String(val).trim() === '') {
        errors.push(`Field '${field.label}' wajib diisi`);
      }
    }
  }

  // SKK special: at least sub_jenis-specific required fields must be present
  if (jenisSurat === 'SKK') {
    if (!formData.sub_jenis || !['Kelahiran','Kematian'].includes(formData.sub_jenis)) {
      errors.push("Field 'Jenis Keterangan' harus 'Kelahiran' atau 'Kematian'");
    }
    if (formData.sub_jenis === 'Kelahiran') {
      const req = ['nama_bayi','tanggal_lahir_bayi','tempat_lahir_bayi',
                   'jenis_kelamin_bayi','nama_ayah','nama_ibu'];
      for (const k of req) {
        if (!formData[k] || String(formData[k]).trim() === '') {
          const f = schema.fields.find(x => x.key === k);
          errors.push(`Field '${f?.label || k}' wajib diisi untuk Kelahiran`);
        }
      }
    }
    if (formData.sub_jenis === 'Kematian') {
      const req = ['nama_almarhum','tanggal_meninggal','tempat_meninggal',
                   'penyebab_kematian','hubungan_pelapor'];
      for (const k of req) {
        if (!formData[k] || String(formData[k]).trim() === '') {
          const f = schema.fields.find(x => x.key === k);
          errors.push(`Field '${f?.label || k}' wajib diisi untuk Kematian`);
        }
      }
    }
  }

  return errors;
}

module.exports = { validateSmartLetterFields };