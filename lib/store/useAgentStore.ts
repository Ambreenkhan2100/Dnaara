'use client';

import { create } from 'zustand';
import { requests } from '@/lib/mock/requests';
import { importers } from '@/lib/mock/users';
import type { Request, RequestStatus } from '@/types';

interface LinkedImporter {
    id: string;
    name: string;
    crNumber: string;
    status: 'active' | 'pending' | 'disabled';
}

interface AgentState {
    linkedImporters: LinkedImporter[];
    upcoming: Request[];
    pending: Request[];
    completed: Request[];

    // Actions
    acceptRequest: (id: string) => void;
    rejectRequest: (id: string) => void;
    submitFinalBayan: (id: string, payload: {
        finalBayanNumber: string;
        finalBayanFileName?: string;
        dutyAmount: number;
        notes?: string;
    }) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
    linkedImporters: [
        { id: 'i1', name: 'Ahmed Al-Mansoori', crNumber: 'CR-12345', status: 'active' },
        { id: 'i2', name: 'Fatima Al-Zahra', crNumber: 'CR-23456', status: 'active' },
        { id: 'i4', name: 'Sara Al-Ahmad', crNumber: 'CR-45678', status: 'active' },
    ],
    upcoming: requests.filter((r) => r.agentId === 'ag1' && r.status === 'ASSIGNED'),
    pending: requests.filter((r) => r.agentId === 'ag1' && r.status === 'CONFIRMED'),
    completed: requests.filter((r) => r.agentId === 'ag1' && r.status === 'COMPLETED'),

    acceptRequest: (id) =>
        set((state) => ({
            upcoming: state.upcoming.filter((r) => r.id !== id),
            pending: [
                ...state.pending,
                ...state.upcoming
                    .filter((r) => r.id === id)
                    .map((r) => ({
                        ...r,
                        status: 'CONFIRMED' as RequestStatus,
                        agentId: 'ag1', // Should be dynamic
                        agentName: 'Ali Customs Services', // Should be dynamic
                        updatedAt: new Date().toISOString(),
                    })),
            ],
        })),

    rejectRequest: (id) =>
        set((state) => ({
            upcoming: state.upcoming.filter((r) => r.id !== id),
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
                        finalBayanNumber: payload.finalBayanNumber,
                        finalBayanFileName: payload.finalBayanFileName,
                        dutyAmount: payload.dutyAmount,
                        notes: payload.notes,
                        status: 'COMPLETED' as RequestStatus,
                        updatedAt: new Date().toISOString(),
                    })),
            ],
        })),
}));

