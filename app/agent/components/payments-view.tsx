'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRoleStore } from '@/lib/store/useRoleStore';
import { useLoader } from '@/components/providers/loader-provider';
import { PaymentStatus } from '@/types/enums/PaymentStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, DollarSign, Calendar, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { PaymentRequest } from '@/types';
import { AgentPaymentForm } from '@/components/forms/agent-payment-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PaymentCard } from '@/components/shared/payment-card';
import { PaymentDetailsDialog } from '@/components/shared/payment-details-dialog';

export function PaymentsView() {
    const { currentUserId } = useRoleStore();
    const { fetchWithLoader } = useLoader();
    const [payments, setPayments] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
    const [comment, setComment] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const fetchPayments = async () => {
        if (!currentUserId) return;
        try {
            const res = await fetchWithLoader(`/api/payment?agent_id=${currentUserId}`);
            if (!res.ok) throw new Error('Failed to fetch payments');
            const data = await res.json();

            // Map API response to PaymentRequest interface
            const mappedPayments: PaymentRequest[] = data.map((p: any) => ({
                id: p.id,
                shipmentId: p.shipment_id,
                agentId: p.agent_id,
                agentName: 'Unknown Agent', // Placeholder as API doesn't return this
                importerId: p.importer_id,
                amount: parseFloat(p.amount),
                description: p.description || '',
                billNumber: p.bill_number,
                bayanNumber: p.bayan_number,
                paymentDeadline: p.payment_deadline,
                paymentType: p.payment_type,
                status: p.payment_status as PaymentStatus,
                createdAt: p.created_at,
                updatedAt: p.updated_at,
                comments: [], // Placeholder
                shipment: p.shipment
            }));
            setPayments(mappedPayments);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [currentUserId]);

    const filteredPayments = useMemo(() => {
        return payments.filter((p) =>
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.agentName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [payments, searchQuery]);

    const getPaymentsByStatus = (status: PaymentStatus) => {
        return filteredPayments.filter((p) => p.status === status);
    };

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
        e.stopPropagation();
        console.log('Delete payment', id);
    };

    const handleEdit = (e: React.MouseEvent<HTMLButtonElement>, payment: PaymentRequest) => {
        e.stopPropagation();
        console.log('Edit payment', payment);
    };

    const handleAddComment = () => {
        if (!selectedPayment || !comment.trim()) return;
        console.log('Add comment', selectedPayment.id, comment);
        setComment('');
        toast.success('Comment added');
    };

    const PaymentList = ({ data }: { data: PaymentRequest[] }) => (
        <div className="space-y-4">
            {data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No payments found</div>
            ) : (
                data.map((payment) => (
                    <PaymentCard
                        key={payment.id}
                        payment={payment}
                        onClick={() => setSelectedPayment(payment)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))
            )}
        </div>
    );

    if (loading) {
        return <div className="text-center py-8">Loading payments...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search payments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
            </div>

            <Tabs defaultValue={PaymentStatus.REQUESTED} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 lg:w-[800px]">
                    <TabsTrigger value={PaymentStatus.REQUESTED}>REQUESTED</TabsTrigger>
                    <TabsTrigger value={PaymentStatus.CONFIRMED}>CONFIRMED</TabsTrigger>
                    <TabsTrigger value={PaymentStatus.REJECTED}>REJECTED</TabsTrigger>
                    <TabsTrigger value={PaymentStatus.COMPLETED}>COMPLETED</TabsTrigger>
                    <TabsTrigger value="all">ALL PAYMENTS</TabsTrigger>
                </TabsList>

                <TabsContent value={PaymentStatus.REQUESTED}>
                    <PaymentList data={getPaymentsByStatus(PaymentStatus.REQUESTED)} />
                </TabsContent>
                <TabsContent value={PaymentStatus.CONFIRMED}>
                    <PaymentList data={getPaymentsByStatus(PaymentStatus.CONFIRMED)} />
                </TabsContent>
                <TabsContent value={PaymentStatus.REJECTED}>
                    <PaymentList data={getPaymentsByStatus(PaymentStatus.REJECTED)} />
                </TabsContent>
                <TabsContent value={PaymentStatus.COMPLETED}>
                    <PaymentList data={getPaymentsByStatus(PaymentStatus.COMPLETED)} />
                </TabsContent>
                <TabsContent value="all">
                    <PaymentList data={filteredPayments} />
                </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Payment Request</DialogTitle>
                        <DialogDescription>
                            Update the payment request details.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <PaymentDetailsDialog
                open={!!selectedPayment && !editDialogOpen}
                onOpenChange={(open) => !open && setSelectedPayment(null)}
                payment={selectedPayment}
                shipment={selectedPayment?.shipment}
                onAddComment={handleAddComment}
            />
        </div>
    );
}
