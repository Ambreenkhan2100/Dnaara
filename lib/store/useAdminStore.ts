'use client';

import { create } from 'zustand';
import { admins, importers, agents } from '@/lib/mock/users';
import { requests } from '@/lib/mock/requests';
import { balances } from '@/lib/mock/balances';
import type { Importer, Agent, Admin, Request, Balance } from '@/types';
import type { RequestStatus } from '@/lib/status';

interface AdminState {
    users: (Importer | Agent | Admin)[];
    requests: Request[];
    balances: Balance[];

    // Actions
    approveUser: (id: string) => void;
    deactivateUser: (id: string) => void;
    createUser: (payload: Partial<Importer | Agent>) => void;
    approveRequest: (id: string) => void;
    rejectRequest: (id: string) => void;
    returnRequest: (id: string) => void;
    adjustBalance: (importerId: string, amount: number) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
    users: [...admins, ...importers, ...agents],
    requests: [...requests],
    balances: [...balances],

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
}));

