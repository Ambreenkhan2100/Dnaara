import type { Balance } from '@/types';

export interface AgentBalance {
    agentId: string;
    available: number;
    lastUpdated: string;
}

export const balances: Balance[] = [
    {
        importerId: 'i1',
        available: 125000,
        lastUpdated: '2024-02-24T10:00:00Z',
    },
    {
        importerId: 'i2',
        available: 85000,
        lastUpdated: '2024-02-24T10:00:00Z',
    },
    {
        importerId: 'i4',
        available: 95000,
        lastUpdated: '2024-02-24T10:00:00Z',
    },
    {
        importerId: 'i5',
        available: 110000,
        lastUpdated: '2024-02-24T10:00:00Z',
    },
];

export const agentBalances: AgentBalance[] = [
    {
        agentId: 'ag1',
        available: 45000,
        lastUpdated: '2024-02-24T10:00:00Z',
    },
    {
        agentId: 'ag2',
        available: 67000,
        lastUpdated: '2024-02-24T10:00:00Z',
    },
];
