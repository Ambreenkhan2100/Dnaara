export type PaymentStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED';

export interface PaymentComment {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
}

export interface PaymentRequest {
    id: string;
    shipmentId: string;
    agentId: string;
    agentName: string;
    importerId: string;
    amount: number;
    description: string;
    status: PaymentStatus;
    createdAt: string;
    updatedAt: string;
    comments: PaymentComment[];
}
