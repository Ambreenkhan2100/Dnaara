'use client';

import { create } from 'zustand';
import { admins, importers, agents } from '@/lib/mock/users';
import { requests } from '@/lib/mock/requests';
import { balances, agentBalances, type AgentBalance } from '@/lib/mock/balances';
import { shipments } from '@/lib/mock/shipments';
import type { Importer, Agent, Admin, Request, Balance } from '@/types';
import type { RequestStatus } from '@/lib/status';
import { payments } from '@/lib/mock/payments';
import type { PaymentRequest } from '@/types';
import { PaymentStatus } from '@/types/enums/PaymentStatus';

interface AdminState {
    users: (Importer | Agent | Admin)[];
    requests: Request[];
    balances: Balance[];
    agentBalances: AgentBalance[];

    // Actions
    approveUser: (id: string) => void;
    deactivateUser: (id: string) => void;
    createUser: (payload: Partial<Importer | Agent>) => void;
    approveRequest: (id: string) => void;
    rejectRequest: (id: string) => void;
    returnRequest: (id: string) => void;
    adjustBalance: (importerId: string, amount: number) => void;
    adjustAgentBalance: (agentId: string, amount: number) => void;

    // Shipments
    shipments: any[]; // Using any[] temporarily, will define proper Shipment type
    createShipment: (shipment: any) => void;
    updateShipment: (id: string, data: any) => void;
    deleteShipment: (id: string) => void;

    // Payments
    payments: PaymentRequest[];
    createPayment: (payment: Partial<PaymentRequest>) => void;
    updatePaymentStatus: (id: string, status: PaymentStatus) => void;
    addPaymentComment: (paymentId: string, comment: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
    users: [...admins, ...importers, ...agents],
    requests: [...requests],
    balances: [...balances],
    agentBalances: [...agentBalances],

    approveUser: (id) =>
        set((state) => ({
            users: state.users.map((user) =>
                user.id === id ? { ...user, status: 'active' as const } : user
            ),
        })),

    deactivateUser: (id) =>
        set((state) => ({
            users: state.users.map((user) =>
                user.id === id ? { ...user, status: 'disabled' as const } : user
            ),
        })),

    createUser: (payload) =>
        set((state) => {
            const newUser = {
                id: `new-${Date.now()}`,
                name: payload.name || '',
                email: payload.email || '',
                phone: payload.phone,
                status: 'pending' as const,
                createdAt: new Date().toISOString(),
                ...payload,
            };
            return { users: [...state.users, newUser as Importer | Agent] };
        }),

    approveRequest: (id) =>
        set((state) => ({
            requests: state.requests.map((req) =>
                req.id === id
                    ? { ...req, status: 'CONFIRMED' as RequestStatus, updatedAt: new Date().toISOString() }
                    : req
            ),
        })),

    rejectRequest: (id) =>
        set((state) => ({
            requests: state.requests.map((req) =>
                req.id === id
                    ? { ...req, status: 'UPCOMING' as RequestStatus, updatedAt: new Date().toISOString() }
                    : req
            ),
        })),

    returnRequest: (id) =>
        set((state) => ({
            requests: state.requests.map((req) =>
                req.id === id
                    ? { ...req, status: 'UPCOMING' as RequestStatus, updatedAt: new Date().toISOString() }
                    : req
            ),
        })),

    adjustBalance: (importerId, amount) =>
        set((state) => ({
            balances: state.balances.map((bal) =>
                bal.importerId === importerId
                    ? { ...bal, available: amount, lastUpdated: new Date().toISOString() }
                    : bal
            ),
        })),

    adjustAgentBalance: (agentId, amount) =>
        set((state) => ({
            agentBalances: state.agentBalances.map((bal) =>
                bal.agentId === agentId
                    ? { ...bal, available: amount, lastUpdated: new Date().toISOString() }
                    : bal
            ),
        })),

    // Shipments
    shipments: [...shipments],
    createShipment: (shipment) =>
        set((state) => ({
            shipments: [
                ...state.shipments,
                {
                    id: `ship-${Date.now()}`,
                    status: 'AT_PORT',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    ...shipment,
                } as any, // Temporary any cast until types are fully aligned
            ],
        })),
    updateShipment: (id, data) =>
        set((state) => ({
            shipments: state.shipments.map((s) =>
                s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
            ),
        })),
    deleteShipment: (id) =>
        set((state) => ({
            shipments: state.shipments.filter((s) => s.id !== id),
        })),

    // Payments
    payments: [...payments as any],
    createPayment: (payment) =>
        set((state) => ({
            payments: [
                ...state.payments,
                {
                    id: `pay-${Date.now()}`,
                    payment_status: 'REQUESTED',
                    created_at: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    comments: [],
                    ...payment,
                } as PaymentRequest,
            ],
        })),

    updatePaymentStatus: (id, status) =>
        set((state) => ({
            payments: state.payments.map((p) =>
                p.id === id ? { ...p, payment_status: status, updatedAt: new Date().toISOString() } : p
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
                                id: `comment-${Date.now()}`,
                                userId: 'admin-1',
                                content: comment,
                                userName: 'Admin',
                                createdAt: new Date().toISOString(),
                            },
                        ],
                        updatedAt: new Date().toISOString(),
                    }
                    : p
            ),
        })),
}));

