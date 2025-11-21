'use client';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShipmentsView } from './components/shipments-view';
import { AgentsView } from './components/agents-view';
import { PaymentsView } from './components/payments-view';

export default function ImporterDashboard() {
    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/importer">Importer</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Importer Dashboard</h1>
                    <p className="text-muted-foreground">Manage your import operations</p>
                </div>
            </div>

            <Tabs defaultValue="shipments" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="shipments">SHIPMENTS</TabsTrigger>
                    <TabsTrigger value="agents">AGENTS</TabsTrigger>
                    <TabsTrigger value="payments">PAYMENTS</TabsTrigger>
                </TabsList>

                <TabsContent value="shipments" className="space-y-4">
                    <ShipmentsView />
                </TabsContent>

                <TabsContent value="agents" className="space-y-4">
                    <AgentsView />
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <PaymentsView />
                </TabsContent>
            </Tabs>
        </div>
    );
}

