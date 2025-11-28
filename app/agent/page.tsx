'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { ShipmentsView } from './components/shipments-view';
import { ImportersView } from './components/importers-view';
import { PaymentsView } from './components/payments-view';
import { NotificationsView } from './components/notifications-view';
import { ReportsView } from './components/reports-view';

export default function AgentDashboard() {
    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/agent">Agent</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Agent Dashboard</h1>
                    <p className="text-muted-foreground">Manage your shipments and operations</p>
                </div>
            </div>

            <Tabs defaultValue="shipments" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
                    <TabsTrigger value="shipments">SHIPMENTS</TabsTrigger>
                    <TabsTrigger value="importers">IMPORTERS</TabsTrigger>
                    <TabsTrigger value="payments">PAYMENTS</TabsTrigger>
                    <TabsTrigger value="notifications">NOTIFICATIONS</TabsTrigger>
                    <TabsTrigger value="reports">REPORTS</TabsTrigger>
                </TabsList>

                <TabsContent value="shipments" className="space-y-4">
                    <ShipmentsView />
                </TabsContent>

                <TabsContent value="importers" className="space-y-4">
                    <ImportersView />
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <PaymentsView />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <NotificationsView />
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <ReportsView />
                </TabsContent>
            </Tabs>
        </div>
    );
}

