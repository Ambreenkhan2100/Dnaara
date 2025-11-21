export type RequestStatus = 'ASSIGNED' | 'CONFIRMED' | 'COMPLETED';

export interface Request {
    // Shipment Details
    type: 'Air' | 'Sea' | 'Land';
    portOfShipment: string;
    portOfDestination: string;
    expectedArrivalDate: string;
    billNumber: string; // Airway bill / B/L / Waybill
    bayanNumber: string;
    bayanFile?: string; // URL/path
    dutyCharges?: number;
    comments?: string;

    // Existing fields
    id: string;
    importerId: string;
    importerName: string;
    agentId?: string;
    agentName?: string;

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

