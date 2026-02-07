import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { StatusBadge } from '@/components/shared/status-badge';
import { format } from 'date-fns';
import { FileText, DollarSign } from 'lucide-react';
import { TransactionHistory } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConnectedUser } from '@/types';
import { PaginationMeta } from '@/types';
import { PaymentStatus } from '@/types/enums/PaymentStatus';

interface TransactionHistoryDrawerProps {
    user: ConnectedUser;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactions: TransactionHistory;
    pagination?: PaginationMeta;
    onPageChange?: (page: number) => void;
    title: string;
    description: string;
}

export function TransactionHistoryDrawer({
    user,
    open,
    onOpenChange,
    transactions,
    pagination,
    onPageChange,
    title,
    description
}: TransactionHistoryDrawerProps) {
    const totalProcessed = transactions.reduce((acc: any, curr: any) => acc + parseFloat(curr.amount), 0);

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case PaymentStatus.COMPLETED: return 'default';
            case PaymentStatus.CONFIRMED: return 'secondary';
            case PaymentStatus.REQUESTED: return 'outline';
            case PaymentStatus.REJECTED: return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-160 max-w-none! overflow-y-auto px-10 py-6">
                <SheetHeader className="mb-4 px-0">
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>
                        {description} {user.legal_business_name || user.full_name}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8">
                    {/* User Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Company Name</p>
                                <p className="font-medium">{user.legal_business_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Status</p>
                                <div className="mt-1">
                                    <StatusBadge status={user.relationship_status === 'ACTIVE' ? 'active' : 'pending'} />
                                </div>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{user.company_email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Phone</p>
                                <p className="font-medium">{user.phone_number || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Contact Person</p>
                                <p className="font-medium">{user.full_name || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Transaction History</h3>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Total Processed: </span>
                                <span className="font-bold">SAR {totalProcessed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="border rounded-lg divide-y">
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <div key={tx.id} className="p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="p-2 rounded-full bg-green-100 text-green-600">
                                                    <DollarSign className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-sm">{tx.payment_type}</p>
                                                        <Badge variant={getStatusBadgeVariant(tx.payment_status)}>
                                                            {tx.payment_status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        {format(new Date(tx.updated_at), 'MMM d, yyyy h:mm a')}
                                                    </p>
                                                    {tx.description && (
                                                        <p className="text-xs text-muted-foreground">{tx.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-sm text-green-600">
                                                    SAR {parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipment Details */}
                                        <div className="ml-11 mt-2 p-3 bg-muted/50 rounded-lg text-xs space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Shipment Type:</span>
                                                <span className="font-medium">{tx.shipment.type}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Route:</span>
                                                <span className="font-medium">{tx.shipment.port_of_shipment} → {tx.shipment.port_of_destination}</span>
                                            </div>
                                            {tx.bill_number && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Bill Number:</span>
                                                    <span className="font-medium">{tx.bill_number}</span>
                                                </div>
                                            )}
                                            {(tx.payment_invoice_url || tx.payment_document_url) && (
                                                <div className="flex gap-2 mt-2">
                                                    {tx.payment_invoice_url && (
                                                        <a href={tx.payment_invoice_url} target="_blank" rel="noopener noreferrer">
                                                            <Button variant="outline" size="sm" className="h-6 text-xs">
                                                                <FileText className="h-3 w-3 mr-1" />
                                                                Invoice
                                                            </Button>
                                                        </a>
                                                    )}
                                                    {tx.payment_document_url && (
                                                        <a href={tx.payment_document_url} target="_blank" rel="noopener noreferrer">
                                                            <Button variant="outline" size="sm" className="h-6 text-xs">
                                                                <FileText className="h-3 w-3 mr-1" />
                                                                Receipt
                                                            </Button>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No transactions found
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4">
                                <div className="text-sm text-muted-foreground">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange?.(pagination.currentPage - 1)}
                                        disabled={!pagination.hasPreviousPage}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPageChange?.(pagination.currentPage + 1)}
                                        disabled={!pagination.hasNextPage}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
