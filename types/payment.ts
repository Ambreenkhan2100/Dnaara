import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

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
    paymentType?: string;
    otherPaymentName?: string;
    status: PaymentStatus;
    createdAt: string;
    updatedAt: string;
    comments: PaymentComment[];
}

export interface PaymentData {
    payment_id: string;
    agent_id: string;
    shipment_id: string;
    payment_type: string;
    bayan_number?: string;
    bill_number?: string;
    amount: number;
    payment_deadline: string;
    description?: string;
    status: string;
    created_at: Timestamp;
    updated_at: Timestamp;
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
