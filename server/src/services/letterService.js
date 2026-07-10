// server/src/services/letterService.js

const PDFDocument = require('pdfkit');
const { LETTER_SCHEMAS } = require('../utils/letterSchemas');

/**
 * Format date into Indonesian style.
 * @param {string|Date} dateInput 
 * @returns {string}
 */
function formatIndonesianDate(dateInput) {
  if (!dateInput) return '-';
  let date = dateInput;
  if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  }
  if (isNaN(date.getTime())) return String(dateInput);
  
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Generate official village letter PDF.
 * @param {string} jenisSurat
 * @param {string} nomorSurat
 * @param {object} wargaData { nik, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat }
 * @param {object} formData
 * @returns {Promise<Buffer>}
 */
function generatePdf(jenisSurat, nomorSurat, wargaData, formData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 54, size: 'A4' });
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('error', err => reject(err));

      // Kop Surat (Letterhead)
      doc.font('Helvetica-Bold').fontSize(14).text('PEMERINTAH KABUPATEN BANYUMAS', { align: 'center' });
      doc.text('KECAMATAN BATURRADEN', { align: 'center' });
      doc.fontSize(16).text('KANTOR KEPALA DESA CEMARA', { align: 'center' });
      doc.font('Helvetica').fontSize(9).text('Jl. Raya Desa Cemara No. 1, Baturraden, Banyumas, Kode Pos 53151', { align: 'center' }).moveDown(0.5);
      
      // Double Line Divider
      const y = doc.y;
      doc.moveTo(54, y).lineTo(541, y).lineWidth(2).stroke();
      doc.moveTo(54, y + 3).lineTo(541, y + 3).lineWidth(0.75).stroke();
      doc.moveDown(1.5);

      // Title & Nomor Surat
      const schema = LETTER_SCHEMAS[jenisSurat];
      const title = (schema ? schema.label : 'SURAT KETERANGAN').toUpperCase();
      doc.font('Helvetica-Bold').fontSize(12).text(title, { align: 'center' });
      doc.font('Helvetica').fontSize(11).text(`Nomor: ${nomorSurat}`, { align: 'center' }).moveDown(1.5);

      // Introduction
      doc.font('Helvetica').fontSize(11).text('Yang bertanda tangan di bawah ini Kepala Desa Cemara, Kecamatan Baturraden, Kabupaten Banyumas, menerangkan dengan sebenarnya bahwa:', { align: 'justify', lineGap: 3 }).moveDown(1);

      // Warga Identity Block
      const labelX = 80;
      const valueX = 220;
      
      function writeRow(label, value) {
        const currentY = doc.y;
        doc.font('Helvetica').text(label, labelX, currentY, { width: 130 });
        doc.text(':', valueX - 10, currentY);
        doc.text(String(value || '-'), valueX, currentY, { width: 300 });
        doc.moveDown(0.5);
      }

      writeRow('Nama Lengkap', wargaData.nama_lengkap);
      writeRow('NIK', wargaData.nik);
      const ttl = `${wargaData.tempat_lahir || ''}, ${formatIndonesianDate(wargaData.tanggal_lahir)}`;
      writeRow('Tempat, Tanggal Lahir', ttl);
      writeRow('Jenis Kelamin', wargaData.jenis_kelamin);
      writeRow('Alamat', wargaData.alamat);

      doc.x = 54; // Reset margin
      doc.moveDown(0.5);
      
      // Specific explanation based on jenisSurat
      let explanation = '';
      switch (jenisSurat) {
        case 'SKD':
          explanation = 'Orang tersebut di atas adalah benar-benar penduduk Desa Cemara yang berdomisili pada alamat tersebut di atas. Surat keterangan domisili ini dibuat untuk:';
          break;
        case 'SP':
          explanation = 'Orang tersebut di atas benar adalah warga kami yang mengajukan Surat Pindah dengan detail kepindahan sebagai berikut:';
          break;
        case 'SKK':
          const subJenis = formData.sub_jenis || 'Kelahiran';
          explanation = `Menerangkan bahwa benar telah terjadi peristiwa ${subJenis} dengan rincian detail sebagai berikut:`;
          break;
        case 'SKTM':
          explanation = 'Berdasarkan keterangan yang ada pada kami benar bahwa nama tersebut di atas tergolong dalam keluarga kurang mampu/tidak mampu secara ekonomi. Surat keterangan ini diberikan untuk keperluan:';
          break;
        case 'SKU':
          explanation = 'Menerangkan bahwa orang tersebut di atas benar memiliki usaha aktif di Desa Cemara dengan rincian sebagai berikut:';
          break;
        case 'SPN':
          explanation = 'Orang tersebut di atas benar sedang mengurus persyaratan pernikahan dengan rincian rencana sebagai berikut:';
          break;
        case 'SPORADIK':
          explanation = 'Menerangkan penguasaan fisik bidang tanah (Sporadik) atas nama pemohon dengan rincian batas dan lokasi sebagai berikut:';
          break;
        default:
          explanation = 'Menerangkan bahwa orang tersebut di atas memiliki keperluan keterangan dengan rincian data pendukung sebagai berikut:';
      }
      
      doc.font('Helvetica').text(explanation, { align: 'justify', lineGap: 3 }).moveDown(1);
      
      // Write specific form fields
      if (schema && schema.fields) {
        schema.fields.forEach(field => {
          // Skip sub_jenis field label display because it is already handled in explanation
          if (jenisSurat === 'SKK' && field.key === 'sub_jenis') return;
          
          // Skip fields that are conditional and don't match values
          if (field.showWhen) {
            if (formData[field.showWhen.field] !== field.showWhen.value) return;
          }
          
          let val = formData[field.key];
          // Format number to currency if it contains Rp or is currency-based
          if (field.type === 'number' && (field.key.includes('penghasilan') || field.key.includes('omzet'))) {
            val = 'Rp ' + Number(val || 0).toLocaleString('id-ID');
          } else if (field.type === 'date') {
            val = formatIndonesianDate(val);
          }
          
          writeRow(field.label, val);
        });
      }

      doc.x = 54; // Reset margin
      doc.moveDown(1);
      doc.font('Helvetica').text('Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.', { align: 'justify', lineGap: 3 }).moveDown(2.5);

      // Place signature block on the bottom right
      const currentY = doc.y;
      if (currentY > 620) {
        doc.addPage();
      }
      
      const signY = doc.y;
      const signX = 350;
      
      doc.font('Helvetica').text(`Cemara, ${formatIndonesianDate(new Date())}`, signX, signY);
      doc.text('Kepala Desa Cemara,', signX, doc.y + 3);
      doc.moveDown(4); // Space for signature
      
      const nameY = doc.y;
      doc.font('Helvetica-Bold').text('KURNIAWAN, S.IP.', signX, nameY);

      doc.end();
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generatePdf };
