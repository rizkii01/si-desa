-- 008_activity_history.sql
-- Tabel riwayat aktivitas warga dan admin

CREATE TABLE IF NOT EXISTS activity_history (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_history(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_history(entity_type, entity_id);
