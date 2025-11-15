export interface Balance {
    importerId: string;
    available: number;
    lastUpdated: string;
}
export interface Notification {
    id: string;
    subject: string;
    body: string;
    audience: 'all' | 'importer' | 'agent' | 'selected';
    recipientIds?: string[];
    createdAt: string;
}


