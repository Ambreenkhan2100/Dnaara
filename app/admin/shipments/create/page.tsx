'use client';

import { useAdminStore } from '@/lib/store/useAdminStore';
import { CreateShipmentForm, type CreateShipmentFormData } from '@/components/forms/create-shipment-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CreateAdminShipmentInput } from '@/lib/schemas';

export default function CreateAdminShipmentPage() {
    const { createShipment, users } = useAdminStore();
    const router = useRouter();

    const importers = useMemo(() => users.filter(u => u.type === 'importer' && u.status === 'active'), [users]);
    const agents = useMemo(() => users.filter(u => u.type === 'agent' && u.status === 'active'), [users]);

    const handleSubmit = async (data: CreateShipmentFormData) => {
        try {
            // Map CreateShipmentFormData to CreateAdminShipmentInput
            // Note: CreateShipmentFormData has some fields that might need conversion or are extra
            // Assuming the store's createShipment expects CreateAdminShipmentInput

            const shipmentData: CreateAdminShipmentInput = {
                importerId: data.importerId!,
                agentId: data.agentId!,
                type: data.type.toLowerCase() as 'air' | 'sea' | 'land',
                portOfShipment: data.portOfShipment,
                portOfDestination: data.portOfDestination,
                expectedArrival: data.expectedArrivalDate,
                billNumber: data.billNumber,
                bayanNumber: data.bayanNumber,
                dutyAmount: parseFloat(data.dutyCharges) || 0,
                comments: data.comments,
                // These fields are not in CreateShipmentFormData but required by CreateAdminShipmentInput
                // We'll default them to false as per plan
                notifyImporter: false,
                notifyAgent: false,
                numberOfPallets: data.numberOfPallets,
                trucks: data.trucks,
            };

            await createShipment(shipmentData);
            toast.success('Shipment created successfully');
            router.push('/admin/shipments');
        } catch (error) {
            console.error('Failed to create shipment:', error);
            toast.error('Failed to create shipment');
        }
    };

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center space-x-4">
                <Link href="/admin/shipments">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Create New Shipment</h2>
                    <p className="text-muted-foreground">
                        Add a new shipment record to the system.
                    </p>
                </div>
            </div>

            <Card className="max-w-4xl">
                <CardHeader>
                    <CardTitle>Shipment Details</CardTitle>
                    <CardDescription>
                        Fill in the details below to create a new shipment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateShipmentForm
                        role="admin"
                        onSubmit={handleSubmit}
                        onCancel={() => router.push('/admin/shipments')}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
