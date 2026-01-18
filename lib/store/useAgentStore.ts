'use client';

import { create } from 'zustand';
import { requests } from '@/lib/mock/requests';
import { importers } from '@/lib/mock/users';
import type { Request, RequestStatus, PaymentRequest } from '@/types';
import type { CreatePaymentInput } from '@/lib/schemas';
import { PaymentStatus } from '@/types/enums/PaymentStatus';

interface LinkedImporter {
    id: string;
    name: string;
    companyName: string;
    email: string;
    phone: string;
    crNumber: string;
    status: 'active' | 'pending' | 'disabled';
}

interface AgentState {
    linkedImporters: LinkedImporter[];
    upcoming: Request[];
    pending: Request[];
    completed: Request[];
    payments: PaymentRequest[];

    // Actions
    acceptRequest: (id: string, comment?: string) => void;
    rejectRequest: (id: string, comment?: string) => void;
    updateShipment: (id: string, note: string, file?: File) => void;
    submitFinalBayan: (id: string, payload: {
        finalBayanNumber: string;
        finalBayanFileName?: string;
        dutyAmount: number;
        notes?: string;
    }) => void;
    addImporter: (importer: { email: string }) => void;
    createPayment: (payment: CreatePaymentInput) => void;
    updatePayment: (id: string, data: Partial<PaymentRequest>) => void;
    deletePayment: (id: string) => void;
    addPaymentComment: (id: string, comment: string) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
    linkedImporters: [
        {
            id: 'i1',
            name: 'Ahmed Al-Mansoori',
            companyName: 'Al-Mansoori Trading',
            email: 'ahmed@almansoori.com',
            phone: '+966 50 123 4567',
            crNumber: 'CR-12345',
            status: 'active'
        },
        {
            id: 'i2',
            name: 'Fatima Al-Zahra',
            companyName: 'Zahra Imports',
            email: 'fatima@zahra.com',
            phone: '+966 50 234 5678',
            crNumber: 'CR-23456',
            status: 'active'
        },
        {
            id: 'i4',
            name: 'Sara Al-Ahmad',
            companyName: 'Sara Co.',
            email: 'sara@saraco.com',
            phone: '+966 50 345 6789',
            crNumber: 'CR-45678',
            status: 'active'
        },
    ],
    upcoming: [
        {
            id: 'req-1',
            importerId: 'i1',
            importerName: 'Ahmed Al-Mansoori',
            agentId: 'ag1',
            status: 'ASSIGNED',
            type: 'sea',
            portOfShipment: 'Jebel Ali',
            portOfDestination: 'Dammam',
            expectedArrival: '2023-12-01',
            billNo: 'BL-123456',
            bayanNo: 'BAY-7890',
            dutyAmount: 5000,
            createdAt: '2023-11-20T10:00:00Z',
            updatedAt: '2023-11-20T10:00:00Z',
        },
        {
            id: 'req-2',
            importerId: 'i2',
            importerName: 'Fatima Al-Zahra',
            agentId: 'ag1',
            status: 'ASSIGNED',
            type: 'air',
            portOfShipment: 'Dubai Airport',
            portOfDestination: 'Riyadh Airport',
            expectedArrival: '2023-11-25',
            billNo: 'AWB-987654',
            bayanNo: 'BAY-4321',
            dutyAmount: 1200,
            createdAt: '2023-11-21T09:00:00Z',
            updatedAt: '2023-11-21T09:00:00Z',
        },
        {
            id: 'req-at-port-1',
            importerId: 'i1',
            importerName: 'Ahmed Al-Mansoori',
            agentId: 'ag1',
            status: 'ASSIGNED',
            type: 'sea',
            portOfShipment: 'Singapore',
            portOfDestination: 'King Abdulaziz Port',
            expectedArrival: '2025-12-01',
            billNo: 'BL-SG-KAP-789',
            bayanNo: 'BAY-2025-789',
            dutyAmount: 8500,
            createdAt: '2025-11-15T08:00:00Z',
            updatedAt: '2025-12-01T14:00:00Z',
            updates: [
                {
                    date: '2025-12-01T14:00:00Z',
                    note: 'Shipment has arrived and is now at the port awaiting customs clearance',
                    author: 'Agent'
                }
            ]
        },
        {
            id: 'req-at-port-2',
            importerId: 'i4',
            importerName: 'Sara Al-Ahmad',
            agentId: 'ag1',
            status: 'ASSIGNED',
            type: 'air',
            portOfShipment: 'Frankfurt Airport',
            portOfDestination: 'King Khalid International Airport',
            expectedArrival: '2025-11-30',
            billNo: 'AWB-FRA-RUH-456',
            bayanNo: 'BAY-2025-456',
            dutyAmount: 3200,
            createdAt: '2025-11-20T10:00:00Z',
            updatedAt: '2025-11-30T18:00:00Z',
            updates: [
                {
                    date: '2025-11-30T18:00:00Z',
                    note: 'Cargo at port, ready for inspection',
                    author: 'Agent'
                }
            ]
        },
        {
            id: 'req-upcoming-1',
            importerId: 'i2',
            importerName: 'Fatima Al-Zahra',
            agentId: 'ag1',
            status: 'ASSIGNED',
            type: 'land',
            portOfShipment: 'Kuwait City',
            portOfDestination: 'Riyadh',
            expectedArrival: '2025-12-02T10:00:00Z', // Tomorrow morning (within 24 hours)
            billNo: 'WB-KWT-RUH-321',
            bayanNo: 'BAY-2025-321',
            dutyAmount: 1800,
            createdAt: '2025-11-28T09:00:00Z',
            updatedAt: '2025-11-28T09:00:00Z',
        },
        {
            id: 'req-upcoming-2',
            importerId: 'i1',
            importerName: 'Ahmed Al-Mansoori',
            agentId: 'ag1',
            status: 'ASSIGNED',
            type: 'air',
            portOfShipment: 'Paris CDG',
            portOfDestination: 'King Fahd International Airport',
            expectedArrival: '2025-12-02T06:00:00Z', // Tomorrow early morning (within 24 hours)
            billNo: 'AWB-CDG-DMM-654',
            bayanNo: 'BAY-2025-654',
            dutyAmount: 4500,
            createdAt: '2025-11-25T12:00:00Z',
            updatedAt: '2025-11-25T12:00:00Z',
        }
    ] as Request[],
    pending: [
        {
            id: 'req-3',
            importerId: 'i4',
            importerName: 'Sara Al-Ahmad',
            agentId: 'ag1',
            status: 'CONFIRMED',
            type: 'land',
            portOfShipment: 'Batha',
            portOfDestination: 'Riyadh',
            expectedArrival: '2023-11-22',
            billNo: 'WB-112233',
            bayanNo: 'BAY-5566',
            dutyAmount: 300,
            createdAt: '2023-11-15T14:00:00Z',
            updatedAt: '2023-11-16T10:00:00Z',
            updates: [
                { date: '2023-11-16T10:00:00Z', note: 'Shipment cleared customs border', author: 'Agent' }
            ]
        }
    ] as Request[],
    completed: [
        {
            id: 'req-4',
            importerId: 'i1',
            importerName: 'Ahmed Al-Mansoori',
            agentId: 'ag1',
            status: 'COMPLETED',
            type: 'sea',
            portOfShipment: 'Shanghai',
            portOfDestination: 'Jeddah',
            expectedArrival: '2023-10-15',
            billNo: 'BL-998877',
            bayanNo: 'BAY-1122',
            dutyAmount: 15000,
            finalBayanNumber: 'FB-123',
            createdAt: '2023-09-01T08:00:00Z',
            updatedAt: '2023-10-20T16:00:00Z',
        }
    ] as Request[],

    acceptRequest: (id, comment) =>
        set((state) => {
            const request = state.upcoming.find((r) => r.id === id);
            if (!request) return state;
            return {
                upcoming: state.upcoming.filter((r) => r.id !== id),
                pending: [
                    ...state.pending,
                    { ...request, status: 'CONFIRMED', agentNote: comment, updatedAt: new Date().toISOString() }
                ]
            };
        }),

    rejectRequest: (id, comment) =>
        set((state) => ({
            upcoming: state.upcoming.filter((r) => r.id !== id),
            // In a real app, we might move this to a 'rejected' list or update status
        })),

    updateShipment: (id, note, file) =>
        set((state) => ({
            pending: state.pending.map((r) => {
                if (r.id === id) {
                    const newUpdate = {
                        date: new Date().toISOString(),
                        note,
                        file: file ? file.name : undefined,
                        author: 'Agent'
                    };
                    return {
                        ...r,
                        updates: [...(r.updates || []), newUpdate],
                        updatedAt: new Date().toISOString()
                    };
                }
                return r;
            })
        })),

    submitFinalBayan: (id, payload) =>
        set((state) => ({
            pending: state.pending.filter((r) => r.id !== id),
            completed: [
                ...state.completed,
                ...state.pending
                    .filter((r) => r.id === id)
                    .map((r) => ({
                        ...r,
                        ...payload,
                        status: 'COMPLETED' as RequestStatus,
                        updatedAt: new Date().toISOString(),
                    })),
            ],
        })),

    addImporter: (importer) =>
        set((state) => ({
            linkedImporters: [
                ...state.linkedImporters,
                {
                    id: `i${state.linkedImporters.length + 10}`,
                    name: 'Pending',
                    companyName: 'Pending',
                    phone: '',
                    ...importer,
                    crNumber: 'CR-NEW', // Mock CR number
                    status: 'pending',
                },
            ],
        })),

    payments: [
        {
            id: 'pay-1',
            shipmentId: 'req-1',
            agentId: 'ag1',
            agentName: 'Logistics Pro',
            importerId: 'i1',
            amount: 5000,
            description: 'Customs Duty Payment',
            billNumber: 'BL-123456',
            bayanNumber: 'BAY-7890',
            paymentDeadline: '2023-11-30T00:00:00Z',
            status: 'REQUESTED',
            createdAt: '2023-11-22T10:00:00Z',
            updatedAt: '2023-11-22T10:00:00Z',
            comments: []
        },
        {
            id: 'pay-2',
            shipmentId: 'req-4',
            agentId: 'ag1',
            agentName: 'Logistics Pro',
            importerId: 'i1',
            amount: 15000,
            description: 'Final Settlement',
            billNumber: 'BL-998877',
            bayanNumber: 'BAY-1122',
            status: 'COMPLETED',
            createdAt: '2023-10-25T14:00:00Z',
            updatedAt: '2023-10-26T09:00:00Z',
            comments: [
                {
                    id: 'c1',
                    userId: 'i1',
                    userName: 'Ahmed Al-Mansoori',
                    content: 'Payment processed via bank transfer',
                    createdAt: '2023-10-26T09:00:00Z'
                }
            ]
        }
    ] as any[], // Using any[] temporarily to avoid import issues, will fix types

    createPayment: (payment) =>
        set((state) => ({
            payments: [
                ...state.payments,
                {
                    id: `pay-${Date.now()}`,
                    ...payment,
                    agentId: 'ag1',
                    agentName: 'Logistics Pro', // Mock agent name
                    payment_status: PaymentStatus.REQUESTED,
                    created_at: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    comments: []
                }
            ]
        })),

    updatePayment: (id, data) =>
        set((state) => ({
            payments: state.payments.map((p) =>
                p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
            )
        })),

    deletePayment: (id) =>
        set((state) => ({
            payments: state.payments.filter((p) => p.id !== id)
        })),

    addPaymentComment: (id, comment) =>
        set((state) => ({
            payments: state.payments.map((p) => {
                if (p.id === id) {
                    return {
                        ...p,
                        comments: [
                            ...p.comments,
                            {
                                id: `c-${Date.now()}`,
                                userId: 'ag1',
                                userName: 'Logistics Pro',
                                content: comment,
                                createdAt: new Date().toISOString()
                            }
                        ]
                    };
                }
                return p;
            })
        })),
}));

