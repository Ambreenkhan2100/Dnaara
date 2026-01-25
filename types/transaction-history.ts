import { Shipment } from './shipment';

export interface TransactionHistoryItem {
    id: string;
    agent_id: string;
    payment_type: string;
    bayan_number: string;
    bill_number: string;
    amount: string;
    payment_deadline: string;
    description: string;
    payment_status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'REJECTED';
    created_at: string;
    updated_at: string;
    shipment: Shipment;
    payment_document_url: string;
    payment_invoice_url: string;
}

export type TransactionHistory = TransactionHistoryItem[];
