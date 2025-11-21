'use client';

import { create } from 'zustand';
import { requests } from '@/lib/mock/requests';
import { balances } from '@/lib/mock/balances';
import { agents } from '@/lib/mock/users';
import type { Request, RequestStatus, PaymentRequest } from '@/types';
import { payments } from '@/lib/mock/payments';

interface LinkedAgent {
    id: string;
    email: string;
    name: string;
    companyName?: string;
    phone?: string;
    status: 'linked' | 'invited';
}

interface ImporterState {
    linkedAgents: LinkedAgent[];
    walletBalance: number;
    requests: Request[];
    payments: PaymentRequest[];

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
            status: 'linked'
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
    requests: requests.filter((r) => r.importerId === 'i1'), // Filter by current importer
    payments: payments.filter((p) => p.importerId === 'i1'),

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
}));

