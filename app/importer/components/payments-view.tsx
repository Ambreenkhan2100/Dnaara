'use client';

import { useState, useMemo } from 'react';
import { useImporterStore } from '@/lib/store/useImporterStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, DollarSign, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { PaymentRequest } from '@/types';
import { PaymentDetailsDialog } from '@/components/dialogs/payment-details-dialog';

export function PaymentsView() {
    const { payments, addPaymentComment } = useImporterStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
    const [comment, setComment] = useState('');

    const filteredPayments = useMemo(() => {
        return payments.filter((p) =>
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [payments, searchQuery]);

    const getPaymentsByStatus = (status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED') => {
        return filteredPayments.filter((p) => p.status === status);
    };

    const handleAddComment = () => {
        if (!selectedPayment || !comment.trim()) return;
        addPaymentComment(selectedPayment.id, comment);
        setComment('');
        toast.success('Comment added');
    };

    const PaymentCard = ({ payment }: { payment: PaymentRequest }) => (
        <Card
            className="mb-4 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setSelectedPayment(payment)}
        >
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base font-medium">{payment.description}</CardTitle>
                        <p className="text-sm text-muted-foreground">ID: {payment.id}</p>
                    </div>
                    <Badge variant={
                        payment.status === 'COMPLETED' ? 'default' :
                            payment.status === 'CONFIRMED' ? 'secondary' : 'outline'
                    }>
                        {payment.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                        <DollarSign className="mr-2 h-4 w-4" />
                        SAR {payment.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center text-muted-foreground col-span-2">
                        <FileText className="mr-2 h-4 w-4" />
                        Shipment: {payment.shipmentId}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const PaymentList = ({ data }: { data: PaymentRequest[] }) => (
        <div className="space-y-4">
            {data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No payments found</div>
            ) : (
                data.map((payment) => <PaymentCard key={payment.id} payment={payment} />)
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <Tabs defaultValue="requested" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="requested">REQUESTED</TabsTrigger>
                    <TabsTrigger value="confirmed">CONFIRMED</TabsTrigger>
                    <TabsTrigger value="completed">COMPLETED</TabsTrigger>
                    <TabsTrigger value="all">ALL PAYMENTS</TabsTrigger>
                </TabsList>

                <TabsContent value="requested">
                    <PaymentList data={getPaymentsByStatus('REQUESTED')} />
                </TabsContent>
                <TabsContent value="confirmed">
                    <PaymentList data={getPaymentsByStatus('CONFIRMED')} />
                </TabsContent>
                <TabsContent value="completed">
                    <PaymentList data={getPaymentsByStatus('COMPLETED')} />
                </TabsContent>
                <TabsContent value="all">
                    <PaymentList data={filteredPayments} />
                </TabsContent>
            </Tabs>

            <PaymentDetailsDialog
                open={!!selectedPayment}
                onOpenChange={(open) => !open && setSelectedPayment(null)}
                payment={selectedPayment}
                shipment={
                    selectedPayment
                        ? useImporterStore.getState().requests.find(
                            (r) => r.id === selectedPayment.shipmentId
                        )
                        : undefined
                }
                onAddComment={addPaymentComment}
            />
        </div>
    );
}
