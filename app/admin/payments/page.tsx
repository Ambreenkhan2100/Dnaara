'use client';

import { useState, useMemo } from 'react';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Calendar, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AdminPaymentForm } from '@/components/forms/admin-payment-form';
import { PaymentDetailsDialog } from '@/components/shared/payment-details-dialog';
import { format } from 'date-fns';
import type { PaymentRequest } from '@/types';
import { PaymentStatus } from '@/types/enums/PaymentStatus';

export default function AdminPaymentsPage() {
    const { payments, updatePaymentStatus, shipments, addPaymentComment } = useAdminStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

    const getPaymentsByStatus = (status: string) => {
        let filtered = payments;
        if (status !== 'all') {
            filtered = payments.filter((p) => p.payment_status === status);
        }
        return filtered.filter((p) =>
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const handleCardClick = (payment: PaymentRequest) => {
        setSelectedPayment(payment);
        setDetailsDialogOpen(true);
    };

    const handleAddComment = (paymentId: string, comment: string) => {
        addPaymentComment(paymentId, comment);
    };

    const getShipmentForPayment = (shipmentId: string) => {
        return shipments.find(s => s.id === shipmentId);
    };

    const renderPaymentCard = (payment: PaymentRequest) => (
        <Card
            key={payment.id}
            className="mb-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleCardClick(payment)}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{payment.description || `Payment for ${payment.shipmentId}`}</span>
                            <Badge variant="outline">{payment.id}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                Shipment: {payment.shipmentId}
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Created: {format(new Date(payment.created_at), 'PPP')}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-[#0bad85]">
                            SAR {payment.amount?.toLocaleString()}
                        </div>
                        <div className="flex flex-col items-end gap-2 mt-2">
                            {payment.payment_status === 'REQUESTED' && (
                                <Button
                                    size="sm"
                                    onClick={() => updatePaymentStatus(payment.id, PaymentStatus.CONFIRMED)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Confirm Payment
                                </Button>
                            )}
                            {payment.payment_status === 'CONFIRMED' && (
                                <Button
                                    size="sm"
                                    onClick={() => updatePaymentStatus(payment.id, PaymentStatus.COMPLETED)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Mark Completed
                                </Button>
                            )}
                        </div>
                        <Badge
                            className={`mt-1 ${payment.payment_status === 'COMPLETED'
                                ? 'bg-green-500 hover:bg-green-600'
                                : payment.payment_status === 'CONFIRMED'
                                    ? 'bg-blue-500 hover:bg-blue-600'
                                    : 'bg-yellow-500 hover:bg-yellow-600'
                                }`}
                        >
                            {payment.payment_status}
                        </Badge>
                    </div>
                </div>

                {payment.comments && payment.comments.length > 0 && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm space-y-2">
                        <span className="font-semibold block">Comments:</span>
                        {payment.comments.map((comment: PaymentRequest['comments'][number]) => (
                            <div key={comment.id} className="text-muted-foreground">
                                <span className="font-medium text-foreground">{comment.userName}:</span> {comment.content}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );

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
                            <AdminPaymentForm onSuccess={() => setCreateDialogOpen(false)} />
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

                <Tabs defaultValue="requested" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="requested">PAYMENTS REQUESTED</TabsTrigger>
                        <TabsTrigger value="confirmed">PAYMENTS CONFIRMED</TabsTrigger>
                        <TabsTrigger value="completed">PAYMENTS COMPLETED</TabsTrigger>
                        <TabsTrigger value="all">ALL PAYMENTS</TabsTrigger>
                    </TabsList>

                    <TabsContent value="requested" className="space-y-4">
                        {getPaymentsByStatus('REQUESTED').length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No requested payments found</div>
                        ) : (
                            getPaymentsByStatus('REQUESTED').map(renderPaymentCard)
                        )}
                    </TabsContent>

                    <TabsContent value="confirmed" className="space-y-4">
                        {getPaymentsByStatus('CONFIRMED').length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No confirmed payments found</div>
                        ) : (
                            getPaymentsByStatus('CONFIRMED').map(renderPaymentCard)
                        )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4">
                        {getPaymentsByStatus('COMPLETED').length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No completed payments found</div>
                        ) : (
                            getPaymentsByStatus('COMPLETED').map(renderPaymentCard)
                        )}
                    </TabsContent>

                    <TabsContent value="all" className="space-y-4">
                        {getPaymentsByStatus('all').length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No payments found</div>
                        ) : (
                            getPaymentsByStatus('all').map(renderPaymentCard)
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Payment Details Dialog */}
            <PaymentDetailsDialog
                open={detailsDialogOpen}
                onOpenChange={setDetailsDialogOpen}
                payment={selectedPayment}
                shipment={selectedPayment ? getShipmentForPayment(selectedPayment.shipmentId) : undefined}
                onAddComment={handleAddComment}
            />
        </div>
    );
}
