'use client';

import { create } from 'zustand';
import { requests } from '@/lib/mock/requests';
import { balances } from '@/lib/mock/balances';
import { agents } from '@/lib/mock/users';
import type { Request, RequestStatus, PaymentRequest, WalletTransaction } from '@/types';
import { payments } from '@/lib/mock/payments';

interface LinkedAgent {
    id: string;
    email: string;
    name: string;
    companyName?: string;
    phone?: string;
    status: 'linked' | 'invited';
    minimumBalance?: number;
}

interface ImporterState {
    linkedAgents: LinkedAgent[];
    walletBalance: number;
    requests: Request[];
    payments: PaymentRequest[];
    transactions: WalletTransaction[];

    // Actions
    linkAgentByEmail: (email: string) => void;
    createShipment: (payload: {
        type: 'Air' | 'Sea' | 'Land';
        portOfShipment: string;
        portOfDestination: string;
        expectedArrivalDate: string;
        billNumber: string;
        bayanNumber: string;
        bayanFile?: string;
        dutyCharges?: number;
        comments?: string;
        agentId?: string;
    }) => void;
    updateShipment: (requestId: string, updates: Partial<Request>) => void;
    submitUpcomingToAgent: (requestId: string, agentId: string) => void;
    uploadPreBayan: (requestId: string, fileName: string) => void;
    uploadWaybill: (requestId: string, fileName: string) => void;
    addPaymentComment: (paymentId: string, comment: string) => void;
    updateAgentMinimumBalance: (agentId: string, amount: number) => void;
}

const getInitialBalance = (importerId: string): number => {
    const balance = balances.find((b) => b.importerId === importerId);
    return balance?.available || 0;
};

export const useImporterStore = create<ImporterState>((set, get) => ({
    linkedAgents: [
        {
            id: 'ag1',
            email: 'ali@customs.com',
            name: 'Ali Customs Services',
            companyName: 'Ali Customs Services LLC',
            phone: '+971506789012',
            status: 'linked',
            minimumBalance: 1000
        },
        {
            id: 'ag2',
            email: 'info@dubaiclearance.com',
            name: 'Dubai Clearance Pro',
            companyName: 'Dubai Clearance Pro FZE',
            phone: '+971507890123',
            status: 'linked'
        },
    ],
    walletBalance: getInitialBalance('i1'), // Default to i1, should be dynamic based on current user
    requests: [
        ...requests.filter((r) => r.importerId === 'i1'),
        // At Port shipments
        {
            id: 'imp-at-port-1',
            importerId: 'i1',
            importerName: 'Ahmed Al-Mansoori',
            agentId: 'ag1',
            agentName: 'Ali Customs Services',
            type: 'Sea',
            portOfShipment: 'Mumbai',
            portOfDestination: 'Jeddah Islamic Port',
            expectedArrivalDate: '2025-12-01',
            billNumber: 'BL-MUM-JED-101',
            bayanNumber: 'BAY-2025-101',
            dutyCharges: 12000,
            status: 'ASSIGNED',
            createdAt: '2025-11-10T08:00:00Z',
            updatedAt: '2025-12-01T12:00:00Z',
            updates: [
                {
                    date: '2025-12-01T12:00:00Z',
                    note: 'Shipment at the port, customs inspection scheduled',
                    author: 'Agent'
                }
            ]
        },
        {
            id: 'imp-at-port-2',
            importerId: 'i1',
            importerName: 'Ahmed Al-Mansoori',
            agentId: 'ag2',
            agentName: 'Dubai Clearance Pro',
            type: 'Air',
            portOfShipment: 'Hong Kong Airport',
            portOfDestination: 'King Abdulaziz International Airport',
            expectedArrivalDate: '2025-11-29',
            billNumber: 'AWB-HKG-JED-202',
            bayanNumber: 'BAY-2025-202',
            dutyCharges: 6500,
            status: 'ASSIGNED',
            createdAt: '2025-11-18T10:00:00Z',
            updatedAt: '2025-11-29T16:00:00Z',
            updates: [
                {
                    date: '2025-11-29T16:00:00Z',
                    note: 'Cargo arrived at port, awaiting clearance documentation',
                    author: 'Agent'
                }
            ]
        },
        // Upcoming shipments (within 24 hours)
        {
            id: 'imp-upcoming-1',
            importerId: 'i1',
            importerName: 'Ahmed Al-Mansoori',
            agentId: 'ag1',
            agentName: 'Ali Customs Services',
            type: 'Land',
            portOfShipment: 'Abu Dhabi',
            portOfDestination: 'Riyadh',
            expectedArrivalDate: '2025-12-02T08:00:00Z',
            billNumber: 'WB-AUH-RUH-303',
            bayanNumber: 'BAY-2025-303',
            dutyCharges: 2200,
            status: 'ASSIGNED',
            createdAt: '2025-11-26T14:00:00Z',
            updatedAt: '2025-11-26T14:00:00Z',
        },
        {
            id: 'imp-upcoming-2',
            importerId: 'i1',
            importerName: 'Ahmed Al-Mansoori',
            agentId: 'ag1',
            agentName: 'Ali Customs Services',
            type: 'Air',
            portOfShipment: 'Istanbul Airport',
            portOfDestination: 'King Fahd International Airport',
            expectedArrivalDate: '2025-12-02T14:30:00Z',
            billNumber: 'AWB-IST-DMM-404',
            bayanNumber: 'BAY-2025-404',
            dutyCharges: 5800,
            status: 'ASSIGNED',
            createdAt: '2025-11-22T09:00:00Z',
            updatedAt: '2025-11-22T09:00:00Z',
        }
    ], // Filter by current importer
    payments: payments.filter((p) => p.importerId === 'i1'),
    transactions: [
        {
            id: 'tx-1',
            agentId: 'ag1',
            importerId: 'i1',
            amount: 5000,
            type: 'CREDIT',
            description: 'Initial Wallet Top-up',
            date: '2024-01-15T10:00:00Z',
        },
        {
            id: 'tx-2',
            agentId: 'ag1',
            importerId: 'i1',
            amount: 1500,
            type: 'DEBIT',
            description: 'Payment for Shipment #BL-MUM-JED-101',
            date: '2024-02-20T10:00:00Z',
            referenceId: 'pay-001'
        },
        {
            id: 'tx-3',
            agentId: 'ag2',
            importerId: 'i1',
            amount: 2000,
            type: 'CREDIT',
            description: 'Wallet Top-up',
            date: '2024-01-20T14:00:00Z',
        },
        {
            id: 'tx-4',
            agentId: 'ag2',
            importerId: 'i1',
            amount: 500,
            type: 'DEBIT',
            description: 'Payment for Shipment #AWB-HKG-JED-202',
            date: '2024-02-19T09:00:00Z',
            referenceId: 'pay-002'
        }
    ],

    linkAgentByEmail: (email) =>
        set((state) => {
            const existingAgent = agents.find((a) => a.email === email);
            if (existingAgent) {
                const alreadyLinked = state.linkedAgents.some((la) => la.id === existingAgent.id);
                if (!alreadyLinked) {
                    return {
                        linkedAgents: [
                            ...state.linkedAgents,
                            {
                                id: existingAgent.id,
                                email: existingAgent.email,
                                name: existingAgent.name,
                                companyName: existingAgent.companyName,
                                phone: existingAgent.phone,
                                status: 'linked' as const,
                            },
                        ],
                    };
                }
            } else {
                // Invite new agent
                return {
                    linkedAgents: [
                        ...state.linkedAgents,
                        {
                            id: `invited-${Date.now()}`,
                            email,
                            name: email,
                            status: 'invited' as const,
                        },
                    ],
                };
            }
            return state;
        }),

    createShipment: (payload) =>
        set((state) => {
            const newRequest: Request = {
                id: `req-${Date.now()}`,
                importerId: 'i1', // Should be dynamic
                importerName: 'Ahmed Al-Mansoori', // Should be dynamic

                type: payload.type,
                portOfShipment: payload.portOfShipment,
                portOfDestination: payload.portOfDestination,
                expectedArrivalDate: payload.expectedArrivalDate,
                billNumber: payload.billNumber,
                bayanNumber: payload.bayanNumber,
                bayanFile: payload.bayanFile,
                dutyCharges: payload.dutyCharges,
                comments: payload.comments,

                agentId: payload.agentId,
                agentName: payload.agentId
                    ? state.linkedAgents.find((a) => a.id === payload.agentId)?.name
                    : undefined,

                // status: payload.agentId ? 'PENDING' : 'UPCOMING', // Old logic
                status: 'ASSIGNED' as RequestStatus, // Default to ASSIGNED for new shipments

                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return { requests: [...state.requests, newRequest] };
        }),

    updateShipment: (requestId, updates) =>
        set((state) => ({
            requests: state.requests.map((req) =>
                req.id === requestId ? { ...req, ...updates, updatedAt: new Date().toISOString() } : req
            ),
        })),

    submitUpcomingToAgent: (requestId, agentId) =>
        set((state) => ({
            requests: state.requests.map((req) =>
                req.id === requestId
                    ? {
                        ...req,
                        status: 'ASSIGNED' as RequestStatus,
                        agentId,
                        agentName: state.linkedAgents.find((a) => a.id === agentId)?.name,
                        updatedAt: new Date().toISOString(),
                    }
                    : req
            ),
        })),

    uploadPreBayan: (requestId, fileName) =>
        set((state) => ({
            requests: state.requests.map((req) =>
                req.id === requestId ? { ...req, preBayanFileName: fileName } : req
            ),
        })),

    uploadWaybill: (requestId, fileName) =>
        set((state) => ({
            requests: state.requests.map((req) =>
                req.id === requestId ? { ...req, waybillFileName: fileName } : req
            ),
        })),

    addPaymentComment: (paymentId, comment) =>
        set((state) => ({
            payments: state.payments.map((p) =>
                p.id === paymentId
                    ? {
                        ...p,
                        comments: [
                            ...p.comments,
                            {
                                id: `c-${Date.now()}`,
                                userId: 'i1',
                                userName: 'Ahmed Al-Mansoori',
                                content: comment,
                                createdAt: new Date().toISOString(),
                            },
                        ],
                    }
                    : p
            ),
        })),

    updateAgentMinimumBalance: (agentId, amount) =>
        set((state) => ({
            linkedAgents: state.linkedAgents.map((agent) =>
                agent.id === agentId ? { ...agent, minimumBalance: amount } : agent
            ),
        })),
}));

