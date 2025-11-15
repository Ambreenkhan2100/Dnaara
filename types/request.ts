export type RequestStatus = 'UPCOMING' | 'PENDING' | 'CONFIRMED' | 'COMPLETED';

export interface Request {
    id: string;
    importerId: string;
    importerName: string;
    agentId?: string;
    agentName?: string;
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

