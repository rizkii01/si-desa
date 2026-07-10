/**
 * Generate unique letter number with atomic sequence increment.
 * Format: NNN/KODE/BLN-ROMAWI/TAHUN
 * Example: 001/SKTM/VII/2026, 012/SKD/I/2027
 * 
 * @param {object} conn - Database connection with query method
 * @param {string} jenisSurat - Letter type: 'SKD','SP','SKK','SKTM','SKU','SPN','SPORADIK'
 * @param {Date} approvalDate - Date of approval
 * @returns {Promise<string>} Generated letter number
 */
async function generateLetterNumber(conn, jenisSurat, approvalDate) {
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  
  // Extract month and year from approval date
  const bulan = approvalDate.getMonth() + 1; // getMonth() returns 0-11
  const tahun = approvalDate.getFullYear();
  
  // Validate bulan range
  if (bulan < 1 || bulan > 12) {
    throw new Error(`Invalid month: ${bulan}`);
  }
  
  // Validate jenisSurat
  const validJenis = ['SKD', 'SP', 'SKK', 'SKTM', 'SKU', 'SPN', 'SPORADIK'];
  if (!validJenis.includes(jenisSurat)) {
    throw new Error(`Invalid letter type: ${jenisSurat}`);
  }
  
  // Atomic upsert: insert new sequence or increment existing one
  // PostgreSQL uses ON CONFLICT DO UPDATE instead of MySQL's ON DUPLICATE KEY UPDATE
  await conn.query(
    `INSERT INTO letter_number_sequences (jenis_surat, bulan, tahun, sequence_number)
     VALUES ($1, $2, $3, 1)
     ON CONFLICT (jenis_surat, bulan, tahun) 
     DO UPDATE SET sequence_number = letter_number_sequences.sequence_number + 1`,
    [jenisSurat, bulan, tahun]
  );
  
  // Get the updated sequence number
  const { rows: seq } = await conn.query(
    `SELECT sequence_number FROM letter_number_sequences
     WHERE jenis_surat = $1 AND bulan = $2 AND tahun = $3`,
    [jenisSurat, bulan, tahun]
  );

  if (!seq || !seq.length || !seq[0].sequence_number) {
    throw new Error('Failed to retrieve sequence number');
  }

  // Format the number: zero-pad sequence to 3 digits
  const nnn = String(seq[0].sequence_number).padStart(3, '0');
  
  // Convert month to Roman numeral
  const roman = ROMAN[bulan];
  
  // Return formatted letter number
  return `${nnn}/${jenisSurat}/${roman}/${tahun}`;
}

module.exports = { generateLetterNumber };
