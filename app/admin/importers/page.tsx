'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Mail, Phone, Building2, User, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AdminImporterForm } from '@/components/forms/admin-importer-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLoader } from '@/components/providers/loader-provider';

interface ImporterData {
    id: string;
    email: string;
    role: string;
    status: string;
    phone_number?: string;
    name: string;
    full_name: string;
    created_at: string;
}

export default function AdminImportersPage() {
    const { fetchFn } = useLoader();
    const [importers, setImporters] = useState<ImporterData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const fetchImporters = async () => {
        try {
            const response = await fetchFn('/api/users?role=importer');
            if (response.ok) {
                const data = await response.json();
                setImporters(data);
            } else {
                console.error('Failed to fetch importers');
            }
        } catch (error) {
            console.error('Error fetching importers:', error);
        }
    };

    useEffect(() => {
        fetchImporters();
    }, [fetchFn]);

    const filteredImporters = useMemo(() => {
        return importers.filter((importer) =>
            importer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            importer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            importer.phone_number?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [importers, searchQuery]);

    const handleImporterCreated = () => {
        setCreateDialogOpen(false);
        fetchImporters(); // Refresh the list
    };

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
                            <AdminImporterForm onSuccess={handleImporterCreated} />
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
                                            {searchQuery ? 'No importers found matching your search' : 'No importers found'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredImporters.map((importer) => (
                                        <TableRow key={importer.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    {importer.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {importer.full_name}
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
                                                    {importer.phone_number || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        importer.status?.toLowerCase() === 'active'
                                                            ? 'default'
                                                            : importer.status?.toLowerCase() === 'pending'
                                                                ? 'secondary'
                                                                : 'destructive'
                                                    }
                                                    className={importer.status?.toLowerCase() === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-green-500 hover:bg-green-600'}
                                                >
                                                    {importer.status?.toUpperCase() || 'Active'}
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
