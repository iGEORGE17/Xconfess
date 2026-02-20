-- Create tips table manually
-- Run this in your PostgreSQL database if migration doesn't work

CREATE TABLE IF NOT EXISTS tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confession_id UUID NOT NULL,
    amount DECIMAL(20, 7) NOT NULL,
    tx_id VARCHAR(64) UNIQUE NOT NULL,
    sender_address VARCHAR(56),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tips_confession FOREIGN KEY (confession_id) 
        REFERENCES anonymous_confessions(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS IDX_tips_confession_id ON tips(confession_id);
CREATE INDEX IF NOT EXISTS IDX_tips_tx_id ON tips(tx_id);
