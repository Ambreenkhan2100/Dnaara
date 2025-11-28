'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, MessageSquare, Package, AlertCircle, CheckCircle } from 'lucide-react';

interface Notification {
    id: string;
    type: 'message' | 'shipment' | 'payment' | 'update' | 'alert';
    title: string;
    message: string;
    from: string;
    fromType: 'admin' | 'agent';
    time: string;
    read: boolean;
}

export function NotificationsView() {
    // Mock notifications data from admin and agent
    const notifications: Notification[] = [
        {
            id: '1',
            type: 'alert',
            title: 'Payment Request Approved',
            message: 'Your payment request #PAY-2024-089 has been approved and processed.',
            from: 'Admin',
            fromType: 'admin',
            time: '10 minutes ago',
            read: false
        },
        {
            id: '2',
            type: 'update',
            title: 'Shipment Status Update',
            message: 'Your shipment #SHP-2024-045 is now at the port and clearing is in progress.',
            from: 'Ahmed Al-Rashid',
            fromType: 'agent',
            time: '1 hour ago',
            read: false
        },
        {
            id: '3',
            type: 'shipment',
            title: 'Customs Clearance Completed',
            message: 'Your sea freight shipment has been cleared by customs successfully.',
            from: 'Fatima Al-Qasim',
            fromType: 'agent',
            time: '2 hours ago',
            read: false
        },
        {
            id: '4',
            type: 'message',
            title: 'Document Required',
            message: 'Additional documentation needed for shipment #SHP-2024-041. Please upload the required files.',
            from: 'Admin',
            fromType: 'admin',
            time: '4 hours ago',
            read: true
        },
        {
            id: '5',
            type: 'payment',
            title: 'Payment Deadline Reminder',
            message: 'Payment for shipment #SHP-2024-038 is due in 24 hours. Amount: SAR 45,000',
            from: 'Ahmed Al-Rashid',
            fromType: 'agent',
            time: '6 hours ago',
            read: true
        },
        {
            id: '6',
            type: 'update',
            title: 'Agent Assignment',
            message: 'Ahmed Al-Rashid has been assigned to handle your new shipment request.',
            from: 'Admin',
            fromType: 'admin',
            time: 'Yesterday',
            read: true
        },
        {
            id: '7',
            type: 'alert',
            title: 'Shipment Delay Notice',
            message: 'Your air freight shipment is experiencing a delay due to weather conditions. New ETA: Tomorrow',
            from: 'Fatima Al-Qasim',
            fromType: 'agent',
            time: 'Yesterday',
            read: true
        },
        {
            id: '8',
            type: 'message',
            title: 'New Feature Announcement',
            message: 'You can now track your shipments in real-time using our updated dashboard.',
            from: 'Admin',
            fromType: 'admin',
            time: '2 days ago',
            read: true
        }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'message': return <MessageSquare className="h-4 w-4" />;
            case 'shipment': return <Package className="h-4 w-4" />;
            case 'payment': return <Bell className="h-4 w-4" />;
            case 'update': return <CheckCircle className="h-4 w-4" />;
            case 'alert': return <AlertCircle className="h-4 w-4" />;
            default: return <Bell className="h-4 w-4" />;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'message': return 'text-blue-500';
            case 'shipment': return 'text-green-500';
            case 'payment': return 'text-purple-500';
            case 'update': return 'text-cyan-500';
            case 'alert': return 'text-orange-500';
            default: return 'text-gray-500';
        }
    };

    const getFromBadgeVariant = (fromType: 'admin' | 'agent') => {
        return fromType === 'admin' ? 'destructive' : 'default';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Notifications</h2>
                    <p className="text-muted-foreground">Stay updated with messages from admin and agents</p>
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
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            {notification.title}
                                            {!notification.read && (
                                                <Badge variant="default" className="text-xs">New</Badge>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="text-xs flex items-center gap-2 mt-1 flex-wrap">
                                            <Clock className="h-3 w-3" />
                                            {notification.time}
                                            <span>•</span>
                                            From: {notification.from}
                                            <Badge variant={getFromBadgeVariant(notification.fromType)} className="text-xs">
                                                {notification.fromType.toUpperCase()}
                                            </Badge>
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
