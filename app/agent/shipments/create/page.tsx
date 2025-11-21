'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAgentStore } from '@/lib/store/useAgentStore';

export default function CreateShipmentPage() {
    const router = useRouter();
    const { linkedImporters } = useAgentStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="importer">Importer</Label>
                                <Select name="importer" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select importer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {linkedImporters.map((importer) => (
                                            <SelectItem key={importer.id} value={importer.id}>
                                                {importer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Shipment Type</Label>
                                <Select name="type" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="air">Air</SelectItem>
                                        <SelectItem value="sea">Sea</SelectItem>
                                        <SelectItem value="land">Land</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="portOfShipment">Port of Shipment</Label>
                                <Input id="portOfShipment" name="portOfShipment" placeholder="e.g. Dubai" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="portOfDestination">Port of Destination</Label>
                                <Input id="portOfDestination" name="portOfDestination" placeholder="e.g. Riyadh" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expectedArrival">Expected Date of Arrival</Label>
                                <Input id="expectedArrival" name="expectedArrival" type="date" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="billNo">Bill No (Airway/B/L/Waybill)</Label>
                                <Input id="billNo" name="billNo" placeholder="Enter bill number" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bayanNo">Bayan No</Label>
                                <Input id="bayanNo" name="bayanNo" placeholder="Enter Bayan number" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dutyCharges">Expected Duty Charges</Label>
                                <Input id="dutyCharges" name="dutyCharges" type="number" placeholder="0.00" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bayanCopy">Upload Bayan Copy</Label>
                            <Input id="bayanCopy" name="bayanCopy" type="file" className="cursor-pointer" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="comments">Additional Comments</Label>
                            <Textarea id="comments" name="comments" placeholder="Any additional notes..." />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create Shipment'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
