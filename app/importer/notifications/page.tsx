'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLoader } from "@/components/providers/loader-provider";
import { Notification } from "@/types";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/useNotifications";
import { useRoleStore } from "@/lib/store/useRoleStore";

import { NotificationCard } from "@/components/shared/notification-card";

interface NotificationResponse {
    data: Notification[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        unreadCount: number;
    };
}

export default function ImporterNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<NotificationResponse['pagination'] | null>(null);
    const { fetchFn: fetchWithLoader } = useLoader();
    const { currentUserId } = useRoleStore();
    const { refreshTrigger } = useNotifications(currentUserId);

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
    }, [currentPage, refreshTrigger]);


    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetchWithLoader('/api/notification', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                toast.success('All notifications marked as read');
                fetchNotifications(currentPage);
            } else {
                toast.error('Failed to mark notifications as read');
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark notifications as read');
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetchWithLoader('/api/notification', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notificationIds: [id] })
            });

            if (res.ok) {
                toast.success('Notification marked as read');
                // Optimistically update the UI
                setNotifications(prev => prev.map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                ));
                // Also refetch to ensure sync
                fetchNotifications(currentPage);
            } else {
                toast.error('Failed to mark notification as read');
            }
        } catch (error) {
            console.error('Error marking as read:', error);
            toast.error('Failed to mark notification as read');
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
                    <p className="text-muted-foreground">Stay updated with messages from agents</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                        {pagination?.unreadCount || 0} Unread
                    </Badge>
                    {(pagination?.unreadCount || 0) > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No notifications found.</div>
                ) : (
                    notifications.map((notification) => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={markAsRead}
                        />
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
