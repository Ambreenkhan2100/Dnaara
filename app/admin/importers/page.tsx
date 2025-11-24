'use client';

import { useState, useMemo } from 'react';
import { useAdminStore } from '@/lib/store/useAdminStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Mail, Phone, Building2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AdminImporterForm } from '@/components/forms/admin-importer-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminImportersPage() {
    const { users } = useAdminStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const importers = useMemo(() => {
        return users.filter((u) => u.type === 'importer');
    }, [users]);

    const filteredImporters = useMemo(() => {
        return importers.filter((importer) =>
            importer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (importer as any).businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            importer.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [importers, searchQuery]);

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Importers</h2>
                    <p className="text-muted-foreground">
                        Manage importers and their account status.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button style={{ backgroundColor: '#0bad85' }}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Importer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Importer</DialogTitle>
                                <DialogDescription>
                                    Enter the importer's details to add them to the system.
                                </DialogDescription>
                            </DialogHeader>
                            <AdminImporterForm onSuccess={() => setCreateDialogOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search importers..."
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
                                    <TableHead>Importer Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredImporters.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No importers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredImporters.map((importer) => (
                                        <TableRow key={importer.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    {(importer as any).businessName || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {importer.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    {importer.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    {importer.phone || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        importer.status === 'active'
                                                            ? 'default'
                                                            : importer.status === 'pending'
                                                                ? 'secondary'
                                                                : 'destructive'
                                                    }
                                                    className={importer.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
                                                >
                                                    {importer.status.toUpperCase()}
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
