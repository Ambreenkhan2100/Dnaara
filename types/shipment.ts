export type ShipmentType = 'Air' | 'Sea' | 'Land';

export enum ShipmentStatusEnum {
    AT_PORT = 'AT_PORT',
    CLEARING_IN_PROGRESS = 'CLEARING_IN_PROGRESS',
    ON_HOLD_BY_CUSTOMS = 'ON_HOLD_BY_CUSTOMS',
    COMPLETED_BY_CUSTOMS = 'COMPLETED_BY_CUSTOMS',
    REJECTED_BY_CUSTOMS = 'REJECTED_BY_CUSTOMS',
    ADDITIONAL_DOCUMENT_REQUIRED = 'ADDITIONAL_DOCUMENT_REQUIRED',
    IN_TRANSIT = 'IN_TRANSIT',
    OTHER = 'OTHER',
    ASSIGNED = 'ASSIGNED',
    CONFIRMED = 'CONFIRMED',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED'
}

export type ShipmentStatus = ShipmentStatusEnum | null;

export interface ShipmentUpdate {
    id: string;
    shipment_id: string;
    update_text: string;
    document_url?: string;
    created_by: string;
    created_at: string;
}

export interface ShipmentTruck {
    id: string;
    shipment_id: string;
    vehicle_number: string;
    driver_name: string;
    driver_mobile_origin?: string;
    driver_mobile_destination?: string;
    created_at: string;
}

export interface Shipment {
    id: string;
    type: ShipmentType;
    port_of_shipment: string;
    port_of_destination: string;
    expected_arrival_date: string;
    bill_number: string;
    bayan_number?: string;
    bayan_file_url?: string;
    commercial_invoice_number?: string;
    commercial_invoice_file_url?: string;
    packing_list_file_url: string;
    purchase_order_number?: string;
    other_documents_urls?: string[];
    duty_charges?: number;
    comments?: string;
    importer_id?: string;
    agent_id?: string;
    payment_partner: string;
    number_of_pallets?: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
    is_accepted: boolean;
    is_completed: boolean;
    status: ShipmentStatus;
    shipment_id: string;
    certificate_of_confirmity_url?: string;
    certificate_of_origin_url?: string;
    saber_certificate_url?: string;

    // Joins/Relations
    trucks?: ShipmentTruck[];
    updates?: ShipmentUpdate[];
    importer?: {
        id: string;
        name: string;
        email: string;
    };
    agent?: {
        id: string;
        name: string;
        email: string;
    };
}
