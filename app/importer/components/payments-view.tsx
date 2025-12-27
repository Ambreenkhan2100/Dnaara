import { useState, useMemo, useEffect } from 'react';
import { useRoleStore } from '@/lib/store/useRoleStore';
import { useLoader } from '@/components/providers/loader-provider';
import { PaymentStatus } from '@/types/enums/PaymentStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentRequest } from '@/types';
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

    const fetchPayments = async () => {
        if (!currentUserId) return;
        try {
            const res = await fetchWithLoader(`/api/payment?importer_id=${currentUserId}`);
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
                    />
                ))
            )}
        </div>
    );

    if (loading) {
        return <div className="text-center py-8">Loading payments...</div>;
    }

    const acceptRejectPayment = async (id: string, status: PaymentStatus.CONFIRMED | PaymentStatus.REJECTED) => {
        try {
            const res = await fetchWithLoader('/api/payment', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, payment_status: status }),
            });

            if (!res.ok) throw new Error('Failed to update payment status');

            toast.success(`Payment ${status.toLowerCase()} successfully`);
            setSelectedPayment(null);
            fetchPayments();
        } catch (error) {
            console.error('Error updating payment status:', error);
            toast.error('Failed to update payment status');
        }
    };

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

            <PaymentDetailsDialog
                open={!!selectedPayment}
                onOpenChange={(open) => !open && setSelectedPayment(null)}
                payment={selectedPayment}
                shipment={selectedPayment?.shipment}
                onAddComment={handleAddComment}
                onConfirmPayment={(id) => acceptRejectPayment(id, PaymentStatus.CONFIRMED)}
                onRejectPayment={(id) => acceptRejectPayment(id, PaymentStatus.REJECTED)}
            />
        </div>
    );
}
