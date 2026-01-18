'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import type { PaymentRequest, Request } from '@/types';
import { Shipment } from '@/types/shipment';
import { Separator } from '@/components/ui/separator';
import { Plane, Ship, Truck, MapPin, Calendar, FileText, DollarSign } from 'lucide-react';
import { PaymentStatus } from '@/types/enums/PaymentStatus';

interface PaymentDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: PaymentRequest | null;
    shipment?: Request | Shipment;
    onAddComment: (paymentId: string, comment: string) => void;
    onConfirmPayment?: (paymentId: string) => void;
    onRejectPayment?: (paymentId: string) => void;
}

export function PaymentDetailsDialog({
    open,
    onOpenChange,
    payment,
    shipment,
    onAddComment,
    onConfirmPayment,
    onRejectPayment
}: PaymentDetailsDialogProps) {
    const [comment, setComment] = useState('');

    if (!payment) return null;

    const handleAddComment = () => {
        if (!comment.trim()) return;
        onAddComment(payment.id, comment);
        setComment('');
        toast.success('Comment added');
    };

    const getIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'air': return <Plane className="h-4 w-4" />;
            case 'sea': return <Ship className="h-4 w-4" />;
            case 'land': return <Truck className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Payment Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Payment Information */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Payment Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium">Amount</p>
                                <p className="text-lg font-bold">SAR {payment.amount.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="font-medium">Status</p>
                                <Badge variant={
                                    payment.payment_status === 'COMPLETED' ? 'default' :
                                        payment.payment_status === 'CONFIRMED' ? 'secondary' : 'outline'
                                }>
                                    {payment.payment_status}
                                </Badge>
                            </div>
                            <div>
                                <p className="font-medium">Bill Number</p>
                                <p>{payment.billNumber || '-'}</p>
                            </div>
                            <div>
                                <p className="font-medium">Bayan Number</p>
                                <p>{payment.bayanNumber || '-'}</p>
                            </div>
                            <div>
                                <p className="font-medium">Payment Deadline</p>
                                <p>{payment.paymentDeadline ? format(new Date(payment.paymentDeadline), 'PPP p') : '-'}</p>
                            </div>
                            <div>
                                <p className="font-medium">Date Created</p>
                                <p>{format(new Date(payment.created_at), 'PPP')}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="font-medium">Description</p>
                                <p className="text-muted-foreground">{payment.description}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Shipment Information */}
                    {shipment && (
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Shipment Details</h4>
                            <div className="bg-muted/30 p-4 rounded-lg space-y-3 text-sm">
                                <div className="flex items-center gap-2 font-medium text-base">
                                    {getIcon(shipment.type)}
                                    <span>{shipment.type} Shipment</span>
                                    <span className="text-muted-foreground text-sm font-normal">({shipment.id})</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{(shipment as any).portOfShipment || (shipment as any).port_of_shipment} → {(shipment as any).portOfDestination || (shipment as any).port_of_destination}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>ETA: {(shipment as any).expectedArrival || (shipment as any).expectedArrivalDate || (shipment as any).expected_arrival_date || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span>Bayan: {(shipment as any).bayanNo || (shipment as any).bayanNumber || (shipment as any).bayan_number || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span>Duty: {(shipment as any).dutyCharges || (shipment as any).dutyAmount || (shipment as any).duty_charges || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Comments Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Comments</h4>
                        <div className="space-y-4 max-h-[200px] overflow-y-auto mb-4 bg-muted/20 p-2 rounded-md">
                            {payment.comments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
                            ) : (
                                payment.comments.map((c) => (
                                    <div key={c.id} className="bg-background border p-3 rounded-md text-sm shadow-sm">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-semibold">{c.userName}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(c.createdAt), 'MMM dd, HH:mm')}
                                            </span>
                                        </div>
                                        <p className="text-foreground/90">{c.content}</p>
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
                {(onConfirmPayment || onRejectPayment) && payment.payment_status === PaymentStatus.REQUESTED && (
                    <>
                        <Separator className="my-4" />
                        <div className="flex justify-end gap-2">
                            {onRejectPayment && (
                                <Button
                                    variant="destructive"
                                    onClick={() => onRejectPayment(payment.id)}
                                >
                                    Reject
                                </Button>
                            )}
                            {onConfirmPayment && (
                                <Button
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => onConfirmPayment(payment.id)}
                                >
                                    Accept
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog >
    );
}
