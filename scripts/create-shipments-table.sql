CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('Air', 'Sea', 'Land')),
    port_of_shipment VARCHAR(255) NOT NULL,
    port_of_destination VARCHAR(255) NOT NULL,
    expected_arrival_date DATE NOT NULL,
    bill_number VARCHAR(255) NOT NULL,
    bayan_number VARCHAR(255),
    bayan_file_url TEXT,
    commercial_invoice_number VARCHAR(255),
    commercial_invoice_file_url TEXT,
    packing_list_file_url TEXT NOT NULL,
    purchase_order_number VARCHAR(255),
    other_documents_urls TEXT[], -- Array of URLs
    duty_charges DECIMAL(10, 2),
    comments TEXT,
    importer_id UUID REFERENCES users(id),
    agent_id UUID REFERENCES users(id),
    payment_partner VARCHAR(50) NOT NULL,
    number_of_pallets INTEGER,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_accepted BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS shipment_trucks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(255) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    driver_mobile_origin VARCHAR(50),
    driver_mobile_destination VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    update_text TEXT NOT NULL,
    document_url TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
