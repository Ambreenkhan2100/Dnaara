import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { PaymentStatus } from "./enums/PaymentStatus";


export interface PaymentComment {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
}
import { Shipment } from "./shipment";

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
    shipment?: Shipment;
}

export interface PaymentData {
    payment_id: string;
    agent_id: string;
    shipment_id: string;
    importer_id: string;
    payment_type: string;
    bayan_number?: string;
    bill_number?: string;
    amount: number;
    payment_deadline: string;
    description?: string;
    payment_status: PaymentStatus;
    payment_document_url?: string;
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
