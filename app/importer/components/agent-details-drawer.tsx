import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useImporterStore } from '@/lib/store/useImporterStore';
import { StatusBadge } from '@/components/shared/status-badge';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface AgentDetailsDrawerProps {
    agentId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AgentDetailsDrawer({ agentId, open, onOpenChange }: AgentDetailsDrawerProps) {
    const { linkedAgents, transactions } = useImporterStore();
    const agent = linkedAgents.find((a) => a.id === agentId);

    if (!agent) return null;

    const agentTransactions = transactions.filter((t) => t.agentId === agentId);
    const totalProcessed = agentTransactions.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-160 max-w-none! overflow-y-auto px-10 py-6">
                <SheetHeader className="mb-4 px-0">
                    <SheetTitle>Agent Details</SheetTitle>
                    <SheetDescription>
                        View details and transaction history for {agent.name}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8">
                    {/* Agent Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Company Name</p>
                                <p className="font-medium">{agent.companyName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Status</p>
                                <div className="mt-1">
                                    <StatusBadge status={agent.status === 'linked' ? 'active' : 'pending'} />
                                </div>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{agent.email}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Phone</p>
                                <p className="font-medium">{agent.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Minimum Balance</p>
                                <p className="font-medium">
                                    {agent.minimumBalance ? `SAR ${agent.minimumBalance.toLocaleString()}` : '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Transaction History</h3>
                            <div className="text-sm">
                                <span className="text-muted-foreground">Total Processed: </span>
                                <span className="font-bold">SAR {totalProcessed.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="border rounded-lg divide-y">
                            {agentTransactions.length > 0 ? (
                                agentTransactions.map((tx) => (
                                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {tx.type === 'CREDIT' ? (
                                                    <ArrowDownLeft className="h-4 w-4" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{tx.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(tx.date), 'MMM d, yyyy h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`font-semibold text-sm ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'CREDIT' ? '+' : '-'} SAR {tx.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No transactions found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
