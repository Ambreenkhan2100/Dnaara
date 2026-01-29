'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AdminPaymentForm } from '@/components/forms/admin-payment-form';
import { PaymentDetailsDialog } from '@/components/shared/payment-details-dialog';
import { PaymentCard } from '@/components/shared/payment-card';
import type { PaymentRequest } from '@/types';
import { toast } from 'sonner';
import { PaymentStatus } from '@/types/enums/PaymentStatus';
import { useRouterWithLoader } from '@/hooks/use-router-with-loader';

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<PaymentRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouterWithLoader()

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/payment', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-user-role': 'admin',
                },
            });

            if (!res.ok) throw new Error('Failed to fetch payments');
            const data = await res.json();
            setPayments(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const getPaymentsByStatus = (status: string) => {
        let filtered = payments;
        if (status !== 'all') {
            filtered = payments.filter((p) => p.payment_status === status);
        }
        return filtered.filter((p) =>
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.shipment?.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const handleCardClick = (payment: PaymentRequest) => {
        router.push(`/admin/payments/${payment.id}`)
    };

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
                    <p className="text-muted-foreground">
                        Manage payment requests and transactions.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button style={{ backgroundColor: '#0bad85' }}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Payment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create Payment Request</DialogTitle>
                                <DialogDescription>
                                    Enter payment details for a shipment.
                                </DialogDescription>
                            </DialogHeader>
                            <AdminPaymentForm onSuccess={() => {
                                setCreateDialogOpen(false);
                                fetchPayments();
                            }} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search payments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading payments...</div>
                ) : (
                    <Tabs defaultValue="requested" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="requested">PAYMENTS REQUESTED</TabsTrigger>
                            <TabsTrigger value="confirmed">PAYMENTS CONFIRMED</TabsTrigger>
                            <TabsTrigger value="completed">PAYMENTS COMPLETED</TabsTrigger>
                            <TabsTrigger value="all">ALL PAYMENTS</TabsTrigger>
                        </TabsList>

                        <TabsContent value="requested" className="space-y-4">
                            {getPaymentsByStatus(PaymentStatus.REQUESTED).length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No requested payments found</div>
                            ) : (
                                getPaymentsByStatus(PaymentStatus.REQUESTED).map((payment) => (
                                    <PaymentCard
                                        key={payment.id}
                                        payment={payment}
                                        onClick={() => handleCardClick(payment)}
                                    />
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="confirmed" className="space-y-4">
                            {getPaymentsByStatus(PaymentStatus.CONFIRMED).length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No confirmed payments found</div>
                            ) : (
                                getPaymentsByStatus(PaymentStatus.CONFIRMED).map((payment) => (
                                    <PaymentCard
                                        key={payment.id}
                                        payment={payment}
                                        onClick={() => handleCardClick(payment)}
                                    />
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="completed" className="space-y-4">
                            {getPaymentsByStatus(PaymentStatus.COMPLETED).length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No completed payments found</div>
                            ) : (
                                getPaymentsByStatus(PaymentStatus.COMPLETED).map((payment) => (
                                    <PaymentCard
                                        key={payment.id}
                                        payment={payment}
                                        onClick={() => handleCardClick(payment)}
                                    />
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="all" className="space-y-4">
                            {getPaymentsByStatus('all').length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No payments found</div>
                            ) : (
                                getPaymentsByStatus('all').map((payment) => (
                                    <PaymentCard
                                        key={payment.id}
                                        payment={payment}
                                        onClick={() => handleCardClick(payment)}
                                    />
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}
