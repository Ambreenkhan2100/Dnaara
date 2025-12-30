export interface Notification {
    id?: string;
    recipientId: string;
    senderId: string;
    title: string;
    message: string;
    entityType: string;
    entityId: string;
    isRead?: boolean;
    createdAt?: string;
}