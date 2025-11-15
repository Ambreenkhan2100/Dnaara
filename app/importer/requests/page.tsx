'use client';

import { useState, useMemo } from 'react';
import { useImporterStore } from '@/lib/store/useImporterStore';
import { RequestsTable } from '@/components/tables/requests-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import type { Request } from '@/types';

export default function ImporterRequestsPage() {
    const { requests, submitUpcomingToAgent, linkedAgents } = useImporterStore();
    const [selectedTab, setSelectedTab] = useState<string>('upcoming');

    const upcoming = useMemo(() => requests.filter((r) => r.status === 'UPCOMING'), [requests]);
    const pending = useMemo(() => requests.filter((r) => r.status === 'PENDING'), [requests]);
    const confirmed = useMemo(() => requests.filter((r) => r.status === 'CONFIRMED'), [requests]);
    const completed = useMemo(() => requests.filter((r) => r.status === 'COMPLETED'), [requests]);

    const handleSubmitToAgent = (request: Request) => {
        if (!request.agentId && linkedAgents.length > 0) {
            const firstAgent = linkedAgents.find((a) => a.status === 'linked');
            if (firstAgent) {
                submitUpcomingToAgent(request.id, firstAgent.id);
                toast.success('Request submitted to agent');
            } else {
                toast.error('No linked agents available');
            }
        } else if (request.agentId) {
            submitUpcomingToAgent(request.id, request.agentId);
            toast.success('Request submitted to agent');
        } else {
            toast.error('Please assign an agent first');
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/importer">Importer</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Requests</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-3xl font-bold">Requests</h1>
                <p className="text-muted-foreground">Track all your import requests</p>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6">
                    <RequestsTable
                        data={upcoming}
                        actions={(request) => (
                            <>
                                {request.status === 'UPCOMING' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSubmitToAgent(request)}
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Submit to Agent
                                    </Button>
                                )}
                            </>
                        )}
                    />
                </TabsContent>

                <TabsContent value="pending" className="mt-6">
                    <RequestsTable data={pending} />
                </TabsContent>

                <TabsContent value="confirmed" className="mt-6">
                    <RequestsTable data={confirmed} />
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    <RequestsTable data={completed} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

