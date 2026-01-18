import { Bell, Clock, MessageSquare, Package, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/types";

interface NotificationCardProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
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

    return (
        <Card
            className={`${!notification.isRead ? 'border-l-4 border-l-primary' : ''} group`}
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
                    {!notification.isRead && (
                        <Button
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out cursor-pointer"
                            variant="secondary"
                            size="sm"
                            // className="h-8 w-8 p-0"
                            onClick={() => onMarkAsRead(notification.id || '')}
                            title="Mark as read"
                        >
                            Mark as read
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
            </CardContent>
        </Card>
    );
}
