const pool = require('../config/db');
const logger = require('../utils/logger');

// GET /api/warga/notifications
// GET /api/admin/notifications
exports.getNotifications = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id, submission_id, type, title, message, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// GET /api/warga/notifications/unread-count
// GET /api/admin/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// PUT /api/warga/notifications/:id/read
// PUT /api/admin/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }
    res.json({ message: 'Notifikasi ditandai sebagai dibaca' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// PUT /api/warga/notifications/read-all
// PUT /api/admin/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ message: 'Semua notifikasi ditandai sebagai dibaca' });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
