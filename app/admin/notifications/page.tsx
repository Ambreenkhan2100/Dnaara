'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Send } from 'lucide-react';

const mockNotifications = [
    {
        id: 'n1',
        subject: 'New Request Created',
        body: 'A new import request has been created by Ahmed Al-Mansoori',
        audience: 'all' as const,
        createdAt: '2024-02-24T10:00:00Z',
    },
    {
        id: 'n2',
        subject: 'Request Completed',
        body: 'Request req-001 has been completed successfully',
        audience: 'importer' as const,
        createdAt: '2024-02-23T14:30:00Z',
    },
];

export default function AdminNotificationsPage() {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [audience, setAudience] = useState<string>('all');

    const handleSend = () => {
        if (!subject || !body) {
            toast.error('Please fill in all fields');
            return;
        }
        toast.success('Notification sent (mock)');
        setSubject('');
        setBody('');
        setAudience('all');
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Notifications</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">Compose and manage platform notifications</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Compose Notification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Notification subject"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Body</Label>
                            <Textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Notification message"
                                rows={5}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Audience</Label>
                            <Select value={audience} onValueChange={setAudience}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="importer">Importers Only</SelectItem>
                                    <SelectItem value="agent">Agents Only</SelectItem>
                                    <SelectItem value="selected">Selected Users (Coming Soon)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleSend}
                            className="w-full"
                            style={{ backgroundColor: '#0bad85' }}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Send Notification
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {mockNotifications.map((notif) => (
                                <div key={notif.id} className="border-b pb-4 last:border-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold">{notif.subject}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">{notif.body}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(notif.createdAt), 'MMM dd, yyyy HH:mm')}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 bg-muted rounded">
                                                    {notif.audience}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

