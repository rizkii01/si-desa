/**
 * Generate a reference number in format: REF-{YYYYMMDD}-{6hex}
 * Example: REF-20260715-a3f9c1
 * 
 * @returns {string} Reference number string
 */
function generateReferenceNumber() {
  // Get current date in YYYYMMDD format
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;
  
  // Generate 6 random hex characters
  // Math.random() gives 0-1, toString(16) converts to hex
  // substr(2) removes "0." prefix
  // padEnd ensures we always have 6 characters
  const randomHex = Math.random().toString(16).substr(2, 6);
  const hexPart = randomHex.padEnd(6, '0');
  
  return `REF-${datePart}-${hexPart}`;
}

module.exports = { generateReferenceNumber };