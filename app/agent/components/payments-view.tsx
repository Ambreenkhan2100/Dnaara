'use client';

import { useState, useMemo } from 'react';
import { useAgentStore } from '@/lib/store/useAgentStore';
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

export function PaymentsView() {
    const { payments, deletePayment, addPaymentComment } = useAgentStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
    const [comment, setComment] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const filteredPayments = useMemo(() => {
        return payments.filter((p) =>
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.agentName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [payments, searchQuery]);

    const getPaymentsByStatus = (status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED') => {
        return filteredPayments.filter((p) => p.status === status);
    };

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
        e.stopPropagation();
        deletePayment(id);
        toast.success('Payment request deleted');
    };

    const handleEdit = (e: React.MouseEvent<HTMLButtonElement>, payment: PaymentRequest) => {
        e.stopPropagation();
        setSelectedPayment(payment);
        setEditDialogOpen(true);
    };

    const handleAddComment = () => {
        if (!selectedPayment || !comment.trim()) return;
        addPaymentComment(selectedPayment.id, comment);
        setComment('');
        toast.success('Comment added');
    };

    const PaymentCard = ({ payment }: { payment: PaymentRequest }) => (
        <Card
            className="mb-4 cursor-pointer hover:bg-accent/50 transition-colors relative group"
            onClick={() => {
                setSelectedPayment(payment);
                // Don't open edit dialog here, just view details
            }}
        >
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base font-medium">{payment.description}</CardTitle>
                        <p className="text-sm text-muted-foreground">ID: {payment.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={
                            payment.status === 'COMPLETED' ? 'default' :
                                payment.status === 'CONFIRMED' ? 'secondary' : 'outline'
                        }>
                            {payment.status}
                        </Badge>
                        {payment.status === 'REQUESTED' && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleEdit(e, payment)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the payment request.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={(e) => handleDelete(e, payment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
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
                    <div className="flex items-center text-muted-foreground">
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
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button style={{ backgroundColor: '#0bad85' }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Payment
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Payment Request</DialogTitle>
                            <DialogDescription>
                                Create a new payment request for an importer.
                            </DialogDescription>
                        </DialogHeader>
                        <AgentPaymentForm onSuccess={() => setCreateDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
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

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Payment Request</DialogTitle>
                        <DialogDescription>
                            Update the payment request details.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <AgentPaymentForm
                            initialData={selectedPayment}
                            onSuccess={() => {
                                setEditDialogOpen(false);
                                setSelectedPayment(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={!!selectedPayment && !editDialogOpen} onOpenChange={(open) => !open && setSelectedPayment(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium">Amount</p>
                                    <p>SAR {selectedPayment.amount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Status</p>
                                    <Badge>{selectedPayment.status}</Badge>
                                </div>
                                <div>
                                    <p className="font-medium">Bill Number</p>
                                    <p>{selectedPayment.billNumber || '-'}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Bayan Number</p>
                                    <p>{selectedPayment.bayanNumber || '-'}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Payment Deadline</p>
                                    <p>{selectedPayment.paymentDeadline ? format(new Date(selectedPayment.paymentDeadline), 'PPP p') : '-'}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Agent</p>
                                    <p>{selectedPayment.agentName}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="font-medium">Description</p>
                                    <p className="text-muted-foreground">{selectedPayment.description}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Date</p>
                                    <p>{format(new Date(selectedPayment.createdAt), 'PPP')}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="mb-2 font-medium">Comments</h4>
                                <div className="space-y-4 max-h-[200px] overflow-y-auto mb-4">
                                    {selectedPayment.comments.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No comments yet.</p>
                                    ) : (
                                        selectedPayment.comments.map((c) => (
                                            <div key={c.id} className="bg-muted p-2 rounded-md text-sm">
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-medium">{c.userName}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(c.createdAt), 'MMM dd, HH:mm')}
                                                    </span>
                                                </div>
                                                <p>{c.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="Add a comment..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="min-h-[60px]"
                                    />
                                    <Button onClick={handleAddComment} size="sm" className="self-end">
                                        Post
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
