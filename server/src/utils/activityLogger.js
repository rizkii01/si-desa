const pool = require('../config/db');

/**
 * Log user activity to activity_history table.
 * @param {number} userId
 * @param {string} action - e.g. 'queue_submitted', 'complaint_replied', 'profile_updated'
 * @param {string} entityType - e.g. 'queue', 'complaint', 'smart_letter', 'profile'
 * @param {number|null} entityId
 * @param {string} description - human-readable
 * @param {object} metadata - optional extra data
 */
async function logActivity(userId, action, entityType, entityId, description, metadata = {}) {
  try {
    await pool.query(
      `INSERT INTO activity_history (user_id, action, entity_type, entity_id, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, entityType, entityId, description, JSON.stringify(metadata)]
    );
  } catch (err) {
    // Non-critical — don't break the request if logging fails
  }
}

module.exports = { logActivity };
