export type RequestStatus = 'ASSIGNED' | 'CONFIRMED' | 'COMPLETED';

export interface ShipmentUpdate {
    date: string;
    note: string;
    file?: string;
    author: string;
}

export interface Request {
    // Shipment Details
    type: 'Air' | 'Sea' | 'Land' | 'air' | 'sea' | 'land'; // Allow lowercase too
    portOfShipment: string;
    portOfDestination: string;
    expectedArrival?: string; // Store uses this
    expectedArrivalDate?: string; // Type uses this
    billNo?: string; // Store uses this
    billNumber?: string; // Type uses this
    bayanNo?: string; // Store uses this
    bayanNumber?: string; // Type uses this
    bayanFile?: string; // URL/path
    dutyCharges?: number;
    comments?: string;

    // Existing fields
    id: string;
    importerId: string;
    importerName: string;
    agentId?: string;
    agentName?: string;
    agentNote?: string;

    // Updates
    updates?: ShipmentUpdate[];

    // Legacy/Optional fields (keeping for compatibility if needed, or can be refactored)
    preBayanNumber?: string;
    preBayanFileName?: string;
    waybillNumber?: string;
    waybillFileName?: string;
    finalBayanNumber?: string;
    finalBayanFileName?: string;
    dutyAmount?: number;
    notes?: string;

    status: RequestStatus;
    createdAt: string;
    updatedAt: string;
}

