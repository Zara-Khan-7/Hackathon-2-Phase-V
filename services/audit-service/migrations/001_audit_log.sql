-- Migration: Create audit_log table
-- US5: Stores all task events for compliance and auditing

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255) NOT NULL,
    task_id VARCHAR(255),
    payload JSONB NOT NULL DEFAULT '{}',
    source VARCHAR(100) NOT NULL DEFAULT 'chat-api'
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_event_id ON audit_log(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_task_id ON audit_log(task_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_received_at ON audit_log(received_at DESC);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_audit_log_user_type ON audit_log(user_id, event_type);

COMMENT ON TABLE audit_log IS 'Audit trail for all task events';
COMMENT ON COLUMN audit_log.event_id IS 'Original event ID for idempotency checking';
COMMENT ON COLUMN audit_log.event_type IS 'Event type: task.created, task.updated, task.completed, task.deleted';
COMMENT ON COLUMN audit_log.timestamp IS 'When the event occurred (from publisher)';
COMMENT ON COLUMN audit_log.received_at IS 'When this service received the event';
COMMENT ON COLUMN audit_log.payload IS 'Full event payload as JSON';
