'use client';

import { useState, useMemo } from 'react';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Mail, Phone, Building2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AdminAgentForm } from '@/components/forms/admin-agent-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminAgentsPage() {
    const { users } = useAdminStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const agents = useMemo(() => {
        return users.filter((u) => u.type === 'agent');
    }, [users]);

    const filteredAgents = useMemo(() => {
        return agents.filter((agent) =>
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (agent as any).companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [agents, searchQuery]);

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Agents</h2>
                    <p className="text-muted-foreground">
                        Manage agents and their account status.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button style={{ backgroundColor: '#0bad85' }}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Agent
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Agent</DialogTitle>
                                <DialogDescription>
                                    Enter the agent's details to add them to the system.
                                </DialogDescription>
                            </DialogHeader>
                            <AdminAgentForm onSuccess={() => setCreateDialogOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search agents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company Name</TableHead>
                                    <TableHead>Agent Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAgents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No agents found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAgents.map((agent) => (
                                        <TableRow key={agent.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    {(agent as any).companyName || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {agent.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    {agent.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    {agent.phone || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        agent.status === 'active'
                                                            ? 'default'
                                                            : agent.status === 'pending'
                                                                ? 'secondary'
                                                                : 'destructive'
                                                    }
                                                    className={agent.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
                                                >
                                                    {agent.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
