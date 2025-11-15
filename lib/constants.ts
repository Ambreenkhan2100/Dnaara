export const ROLE_KEYS = ['admin', 'importer', 'agent'] as const;
export type RoleKey = typeof ROLE_KEYS[number];
export const KPI_LABELS = {
    totalImporters: 'Total Importers',
    totalAgents: 'Total Agents',
    totalRequests: 'Total Requests',
    totalBalances: 'Total Balances',
    walletBalance: 'Wallet Balance',
    upcomingRequests: 'Upcoming Requests',
    pendingRequests: 'Pending Requests',
    confirmedRequests: 'Confirmed Requests',
    completedRequests: 'Completed Requests',
} as const;


