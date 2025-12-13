'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useImporterStore } from '@/lib/store/useImporterStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { CreateShipmentForm, CreateShipmentFormData } from '@/components/forms/create-shipment-form';

export default function NewShipmentPage() {
    const router = useRouter();
    const { createShipment, linkedAgents } = useImporterStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: CreateShipmentFormData) => {
        setIsSubmitting(true);

        try {
            createShipment({
                ...data,
                agentId: data.partnerId,
                dutyCharges: data.dutyCharges ? Number(data.dutyCharges) : undefined,
            } as any);
            toast.success('Shipment created successfully');
            router.push('/importer');
        } catch (error) {
            toast.error('Failed to create shipment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/importer">Importer</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>New Shipment</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Create New Shipment</h1>
                    <p className="text-muted-foreground">Enter shipment details to assign to an agent</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Shipment Details</CardTitle>
                    <CardDescription>All fields marked with * are required</CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateShipmentForm
                        role="importer"
                        // partners={linkedAgents}
                        onSubmit={handleSubmit}
                        // isSubmitting={isSubmitting}
                        onCancel={() => router.back()}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
