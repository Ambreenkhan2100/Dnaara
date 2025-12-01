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
    billNumber?: string;
    bayanNumber?: string;
    paymentDeadline?: string;
    status: PaymentStatus;
    createdAt: string;
    updatedAt: string;
    comments: PaymentComment[];
}

export interface WalletTransaction {
    id: string;
    agentId: string;
    importerId: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    description: string;
    date: string;
    referenceId?: string; // e.g., payment ID or shipment ID
}
