-- Add new fields to shipments table
ALTER TABLE shipments 
ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT NULL;

-- Create updates table
CREATE TABLE IF NOT EXISTS updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    update_text TEXT NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
