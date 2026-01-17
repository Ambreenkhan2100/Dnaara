import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, FileText, Edit, Trash2, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { PaymentStatus } from '@/types/enums/PaymentStatus';
import type { PaymentRequest } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PaymentCardProps {
    payment: PaymentRequest;
    onClick: () => void;
    onEdit?: (e: React.MouseEvent<HTMLButtonElement>, payment: PaymentRequest) => void;
    onDelete?: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
}

export function PaymentCard({ payment, onClick, onEdit, onDelete }: PaymentCardProps) {
    return (
        <Card
            className="mb-4 cursor-pointer hover:bg-accent/50 transition-colors relative group"
            onClick={onClick}
        >
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base font-medium">{payment.paymentType || 'Payment Request'}</CardTitle>
                        <div className="flex items-center gap-1 text-muted-foreground h-8">
                            <MapPin className="h-3 w-3" /><p className='leading-none'> {payment.shipment?.port_of_shipment} → {payment.shipment?.port_of_destination}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={
                            payment.status === PaymentStatus.COMPLETED ? 'default' :
                                payment.status === PaymentStatus.CONFIRMED ? 'secondary' : 'outline'
                        }>
                            {payment.status}
                        </Badge>
                        {payment.status === PaymentStatus.REQUESTED && onEdit && onDelete && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => onEdit(e, payment)}>
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
                                            <AlertDialogAction onClick={(e) => onDelete(e, payment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                        <DollarSign className="mr-2 h-4 w-4" />
                        SAR {payment.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        Created On: {payment.createdAt ? format(new Date(payment.createdAt), 'MMM dd, yyyy | HH:mm') : 'N/A'}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        Deadline: {payment.paymentDeadline ? format(new Date(payment.paymentDeadline), 'MMM dd, yyyy | HH:mm') : 'N/A'}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
