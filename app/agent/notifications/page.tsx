'use client'

import { Bell, Clock, MessageSquare, Package } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLoader } from "@/components/providers/loader-provider";
import { Notification } from "@/types";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface NotificationResponse {
    data: Notification[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export default function AgentNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<NotificationResponse['pagination'] | null>(null);
    const { fetchFn: fetchWithLoader } = useLoader();

    const fetchNotifications = async (page: number = 1) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            const res = await fetchWithLoader(`/api/notification?page=${page}&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data: NotificationResponse = await res.json();
            setNotifications(data.data || []);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(currentPage);
    }, [currentPage]);

    const getIcon = (entityType: string) => {
        switch (entityType?.toLowerCase()) {
            case 'message': return <MessageSquare className="h-4 w-4" />;
            case 'shipment': return <Package className="h-4 w-4" />;
            case 'payment': return <Bell className="h-4 w-4" />;
            default: return <Bell className="h-4 w-4" />;
        }
    };

    const getIconColor = (entityType: string) => {
        switch (entityType?.toLowerCase()) {
            case 'message': return 'text-blue-500';
            case 'shipment': return 'text-green-500';
            case 'payment': return 'text-purple-500';
            default: return 'text-gray-500';
        }
    };

    const formatTime = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading notifications...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Notifications</h2>
                    <p className="text-muted-foreground">Stay updated with messages from importers</p>
                </div>
                <Badge variant="secondary">
                    {notifications.filter(n => !n.isRead).length} Unread
                </Badge>
            </div>

            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No notifications found.</div>
                ) : (
                    notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`${!notification.isRead ? 'border-l-4 border-l-primary' : ''}`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 ${getIconColor(notification.entityType)}`}>
                                            {getIcon(notification.entityType)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold">
                                                {notification.title}
                                                {!notification.isRead && (
                                                    <Badge variant="default" className="ml-2 text-xs">New</Badge>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="text-xs flex items-center gap-2 mt-1">
                                                <Clock className="h-3 w-3" />
                                                {notification.createdAt && formatTime(notification.createdAt)}
                                                {notification.companyName && ` • From: ${notification.companyName}`}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        disabled={!pagination.hasPreviousPage}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!pagination.hasNextPage}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}