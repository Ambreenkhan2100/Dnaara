'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAgentStore } from '@/lib/store/useAgentStore';
import { CreateShipmentForm, CreateShipmentFormData } from '@/components/forms/create-shipment-form';
import { useRouterWithLoader } from '@/hooks/use-router-with-loader';

export default function CreateShipmentPage() {
    // const router = useRouter();
    const router = useRouterWithLoader();
    const { linkedImporters } = useAgentStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: CreateShipmentFormData) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
        router.push('/agent');
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/agent">Agent</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/agent">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Create Shipment</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Create New Shipment</h1>
                    <p className="text-muted-foreground">Enter the details for the new shipment</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Shipment Details</CardTitle>
                    <CardDescription>Fill in the information below to create a new shipment request.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateShipmentForm
                        role="agent"
                        // partners={linkedImporters}
                        onSubmit={handleSubmit}
                        // isSubmitting={isLoading}
                        onCancel={() => router.back()}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
