'use client';

import { create } from 'zustand';
import { requests } from '@/lib/mock/requests';
import { balances } from '@/lib/mock/balances';
import { agents } from '@/lib/mock/users';
import type { Request } from '@/types';
import type { RequestStatus } from '@/lib/status';

interface LinkedAgent {
    id: string;
    email: string;
    name: string;
    status: 'linked' | 'invited';
}

interface ImporterState {
    linkedAgents: LinkedAgent[];
    walletBalance: number;
    requests: Request[];

    // Actions
    linkAgentByEmail: (email: string) => void;
    createUpcomingRequest: (payload: {
        preBayanNumber: string;
        preBayanFileName?: string;
        waybillNumber: string;
        waybillFileName?: string;
        agentId?: string;
    }) => void;
    submitUpcomingToAgent: (requestId: string, agentId: string) => void;
    uploadPreBayan: (requestId: string, fileName: string) => void;
    uploadWaybill: (requestId: string, fileName: string) => void;
}

const getInitialBalance = (importerId: string): number => {
    const balance = balances.find((b) => b.importerId === importerId);
    return balance?.available || 0;
};

export const useImporterStore = create<ImporterState>((set, get) => ({
    linkedAgents: [
        { id: 'ag1', email: 'ali@customs.com', name: 'Ali Customs Services', status: 'linked' },
        { id: 'ag2', email: 'info@dubaiclearance.com', name: 'Dubai Clearance Pro', status: 'linked' },
    ],
    walletBalance: getInitialBalance('i1'), // Default to i1, should be dynamic based on current user
    requests: requests.filter((r) => r.importerId === 'i1'), // Filter by current importer

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

    createUpcomingRequest: (payload) =>
        set((state) => {
            const newRequest: Request = {
                id: `req-${Date.now()}`,
                importerId: 'i1', // Should be dynamic
                importerName: 'Ahmed Al-Mansoori', // Should be dynamic
                preBayanNumber: payload.preBayanNumber,
                preBayanFileName: payload.preBayanFileName,
                waybillNumber: payload.waybillNumber,
                waybillFileName: payload.waybillFileName,
                agentId: payload.agentId,
                agentName: payload.agentId
                    ? state.linkedAgents.find((a) => a.id === payload.agentId)?.name
                    : undefined,
                status: 'UPCOMING' as RequestStatus,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            return { requests: [...state.requests, newRequest] };
        }),

    submitUpcomingToAgent: (requestId, agentId) =>
        set((state) => ({
            requests: state.requests.map((req) =>
                req.id === requestId
                    ? {
                        ...req,
                        status: 'PENDING' as RequestStatus,
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
}));

