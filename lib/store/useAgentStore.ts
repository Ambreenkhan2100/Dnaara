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
    acceptRequest: (id: string, comment?: string) => void;
    rejectRequest: (id: string, comment?: string) => void;
    updateShipment: (id: string, note: string, file?: File) => void;
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
}));

