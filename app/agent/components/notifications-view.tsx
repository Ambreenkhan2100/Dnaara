'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, MessageSquare, Package } from 'lucide-react';

interface Notification {
    id: string;
    type: 'message' | 'shipment' | 'payment' | 'update';
    title: string;
    message: string;
    from: string;
    time: string;
    read: boolean;
}

export function NotificationsView() {
    // Mock notifications data
    const notifications: Notification[] = [
        {
            id: '1',
            type: 'message',
            title: 'New Message from Al-Mahmoud Trading',
            message: 'Can you provide an update on shipment #SHP-2024-001?',
            from: 'Al-Mahmoud Trading',
            time: '5 minutes ago',
            read: false
        },
        {
            id: '2',
            type: 'shipment',
            title: 'Shipment Update Required',
            message: 'Green Valley Imports requested an update for their sea shipment.',
            from: 'Green Valley Imports',
            time: '1 hour ago',
            read: false
        },
        {
            id: '3',
            type: 'payment',
            title: 'Payment Request Approved',
            message: 'Your payment request #PAY-2024-045 has been approved by admin.',
            from: 'System',
            time: '2 hours ago',
            read: true
        },
        {
            id: '4',
            type: 'update',
            title: 'Document Uploaded',
            message: 'Saudi Marine Co uploaded new documents for shipment #SHP-2024-012.',
            from: 'Saudi Marine Co',
            time: '3 hours ago',
            read: true
        },
        {
            id: '5',
            type: 'message',
            title: 'Urgent: Customs Clearance',
            message: 'Al-Mahmoud Trading: Please expedite customs clearance for our shipment.',
            from: 'Al-Mahmoud Trading',
            time: 'Yesterday',
            read: true
        },
        {
            id: '6',
            type: 'shipment',
            title: 'New Shipment Assigned',
            message: 'A new air freight shipment has been assigned to you.',
            from: 'System',
            time: '2 days ago',
            read: true
        }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'message': return <MessageSquare className="h-4 w-4" />;
            case 'shipment': return <Package className="h-4 w-4" />;
            case 'payment': return <Bell className="h-4 w-4" />;
            default: return <Bell className="h-4 w-4" />;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'message': return 'text-blue-500';
            case 'shipment': return 'text-green-500';
            case 'payment': return 'text-purple-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Notifications</h2>
                    <p className="text-muted-foreground">Stay updated with messages from importers</p>
                </div>
                <Badge variant="secondary">
                    {notifications.filter(n => !n.read).length} Unread
                </Badge>
            </div>

            <div className="space-y-3">
                {notifications.map((notification) => (
                    <Card
                        key={notification.id}
                        className={`${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 ${getIconColor(notification.type)}`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold">
                                            {notification.title}
                                            {!notification.read && (
                                                <Badge variant="default" className="ml-2 text-xs">New</Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="text-xs flex items-center gap-2 mt-1">
                                            <Clock className="h-3 w-3" />
                                            {notification.time} • From: {notification.from}
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
