'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLoader } from '@/components/providers/loader-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ArrowLeft, Plane, Ship, Truck, FileText, MapPin, Calendar, Upload, SaudiRiyal } from 'lucide-react';
import { PaymentStatus } from '@/types/enums/PaymentStatus';
import type { PaymentRequest } from '@/types';

export default function AgentPaymentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { fetchFn } = useLoader();
    const [payment, setPayment] = useState<PaymentRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [receiptFile, setReceiptFile] = useState<string | null>(null);
    const [receiptFileName, setReceiptFileName] = useState<string>('');

    const fetchPayment = async () => {
        try {
            const res = await fetchFn(`/api/payment/${id}`);
            if (!res.ok) throw new Error('Failed to fetch payment details');
            const data = await res.json();
            setPayment({
                ...data,
                comments: data.comments || [] // Ensure comments array exists
            });
        } catch (error) {
            console.error('Error fetching payment:', error);
            toast.error('Failed to load payment details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayment();
    }, [id]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 10MB limit.`);
            return;
        }

        setReceiptFileName(file.name);

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setReceiptFile(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleCompletePayment = async () => {
        if (!payment || !receiptFile) {
            toast.error('Please upload a payment receipt');
            return;
        }

        try {
            const res = await fetchFn('/api/payment/complete', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: payment.id,
                    file: receiptFile,
                }),
            });

            if (!res.ok) throw new Error('Failed to complete payment');

            toast.success('Payment completed successfully');
            setReceiptFile(null);
            setReceiptFileName('');
            fetchPayment(); // Refresh details
        } catch (error) {
            console.error('Error completing payment:', error);
            toast.error('Failed to complete payment');
        } finally {
        }
    };

    const getIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'air': return <Plane className="h-4 w-4" />;
            case 'sea': return <Ship className="h-4 w-4" />;
            case 'land': return <Truck className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!payment) {
        return <div className="flex justify-center items-center min-h-screen">Payment not found</div>;
    }

    const shipment = payment.shipment;

    return (
        <div className="container mx-auto py-8 max-w-7xl space-y-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:pl-2 transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payments
            </Button>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
                    <p className="text-muted-foreground mt-1">ID: {payment.id}</p>
                </div>
                <Badge variant={
                    payment.payment_status === 'COMPLETED' ? 'default' :
                        payment.payment_status === 'CONFIRMED' ? 'secondary' : 'outline'
                } className="text-lg px-4 py-1">
                    {payment.payment_status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-lg border p-6 shadow-sm space-y-6">
                        <h2 className="text-xl font-semibold">Payment Information</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                <p className="text-2xl font-bold mt-1">SAR {parseFloat(payment.amount).toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Payment Deadline</p>
                                <p className="text-base mt-1">{payment.payment_deadline ? format(new Date(payment.payment_deadline), 'PPP') : '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Bill Number</p>
                                <p className="text-base mt-1">{payment.bill_number || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Bayan Number</p>
                                <p className="text-base mt-1">{payment.bayan_number || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Date Created</p>
                                <p className="text-base mt-1">{format(new Date(payment.created_at), 'PPP')}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p className="text-base mt-1">{payment.description || 'No description provided.'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipment Information */}
                    {shipment && (
                        <div className="bg-card rounded-lg border p-6 shadow-sm space-y-6">
                            <h2 className="text-xl font-semibold">Shipment Details</h2>
                            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
                                <div className="flex items-center gap-3 font-medium text-lg text-primary">
                                    {getIcon(shipment.type)}
                                    <span>{shipment.type} Shipment</span>
                                </div>
                                <p className="text-sm text-muted-foreground">ID: {shipment.shipment_id}</p>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Route</p>
                                            <p className="text-sm text-muted-foreground">
                                                {(shipment as any).portOfShipment || (shipment as any).port_of_shipment}
                                                {' → '}
                                                {(shipment as any).portOfDestination || (shipment as any).port_of_destination}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Expected Arrival</p>
                                            <p className="text-sm text-muted-foreground">
                                                {(shipment as any).expectedArrival || (shipment as any).expectedArrivalDate || (shipment as any).expected_arrival_date || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Bayan No</p>
                                            <p className="text-sm text-muted-foreground">
                                                {(shipment as any).bayanNo || (shipment as any).bayanNumber || (shipment as any).bayan_number || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <SaudiRiyal className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Duty Charges</p>
                                            <p className="text-sm text-muted-foreground">
                                                {(shipment as any).dutyCharges || (shipment as any).dutyAmount || (shipment as any).duty_charges || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar: Actions & Comments (1/3) */}
                <div className="space-y-6">
                    {payment.payment_status === PaymentStatus.CONFIRMED && (
                        <div className="bg-card rounded-lg border p-6 shadow-sm space-y-4">
                            <h2 className="text-xl font-semibold">Complete Payment</h2>
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground">
                                    Payment Receipt
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        id="receipt-upload"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="receipt-upload"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary hover:bg-muted/20 transition-colors"
                                    >
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            {receiptFileName || 'Click to upload receipt'}
                                        </span>
                                    </label>
                                    {receiptFileName && (
                                        <p className="text-xs text-muted-foreground">
                                            Selected: {receiptFileName}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    onClick={handleCompletePayment}
                                    disabled={!receiptFile}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Complete Payment
                                </Button>
                            </div>
                        </div>
                    )}

                    {(payment.payment_invoice_url?.length || payment.payment_document_url?.length) &&
                        (<div className="bg-card rounded-lg border p-6 shadow-sm space-y-4 h-fit">
                            <h2 className="text-xl font-semibold">Documents</h2>
                            {payment.payment_invoice_url && (
                                <div className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span className="text-sm truncate">Payment Invoice</span>
                                    </div>
                                    <a href={payment.payment_invoice_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">View</Button>
                                    </a>
                                </div>
                            )}
                            {payment.payment_document_url && (
                                <div className="flex items-center justify-between p-2 border rounded hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span className="text-sm truncate">Payment Receipt</span>
                                    </div>
                                    <a href={payment.payment_document_url} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm">View</Button>
                                    </a>
                                </div>
                            )}
                        </div>)}
                </div>
            </div>
        </div>
    );
}
