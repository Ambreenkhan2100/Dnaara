'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/store/useUserStore';
import { useLoader } from '@/components/providers/loader-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EmailRow {
    id: string;
    value: string;
    isEdit: boolean;
    originalValue: string;
    error?: string;
}

export function UserProfileComponent() {
    const { userProfile, updateEmails } = useUserStore();
    const { fetchFn } = useLoader();

    const [localEmails, setLocalEmails] = useState<EmailRow[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize local emails from store when profile loads
    useEffect(() => {
        if (userProfile?.emails) {
            setLocalEmails(
                userProfile.emails.map((email) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    value: email,
                    isEdit: false,
                    originalValue: email,
                }))
            );
        }
    }, [userProfile]);

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleAddRow = () => {
        const newRow: EmailRow = {
            id: Math.random().toString(36).substr(2, 9),
            value: '',
            isEdit: true,
            originalValue: '',
        };
        setLocalEmails([newRow, ...localEmails]);
    };

    const handleEditRow = (id: string) => {
        setLocalEmails(
            localEmails.map((row) =>
                row.id === id ? { ...row, isEdit: true, error: undefined } : row
            )
        );
    };

    const handleCancelEdit = (id: string) => {
        const row = localEmails.find((r) => r.id === id);
        if (!row) return;

        if (!row.originalValue) {
            // If it was a new row (empty original), remove it
            setLocalEmails(localEmails.filter((r) => r.id !== id));
        } else {
            // Revert to original value
            setLocalEmails(
                localEmails.map((r) =>
                    r.id === id
                        ? { ...r, value: r.originalValue, isEdit: false, error: undefined }
                        : r
                )
            );
        }
    };

    const handleSaveRow = (id: string) => {
        const row = localEmails.find((r) => r.id === id);
        if (!row) return;

        if (!validateEmail(row.value)) {
            setLocalEmails(
                localEmails.map((r) =>
                    r.id === id ? { ...r, error: 'Invalid email format' } : r
                )
            );
            return;
        }

        // Check for duplicates (excluding itself)
        const isDuplicate = localEmails.some(
            (r) => r.id !== id && r.value.toLowerCase() === row.value.toLowerCase()
        );

        if (isDuplicate) {
            setLocalEmails(
                localEmails.map((r) =>
                    r.id === id ? { ...r, error: 'Email already exists' } : r
                )
            );
            return;
        }

        setLocalEmails(
            localEmails.map((r) =>
                r.id === id
                    ? { ...r, isEdit: false, originalValue: r.value, error: undefined }
                    : r
            )
        );
    };

    const handleDeleteRow = (id: string) => {
        setLocalEmails(localEmails.filter((r) => r.id !== id));
    };

    const handleInputChange = (id: string, newValue: string) => {
        setLocalEmails(
            localEmails.map((r) =>
                r.id === id ? { ...r, value: newValue, error: undefined } : r
            )
        );
    };

    const handleSaveEmails = async () => {
        const hasPendingEdits = localEmails.some((r) => r.isEdit);
        if (hasPendingEdits) {
            alert('Please save all pending edits before saving changes.');
            return;
        }

        if (!userProfile) return;
        setIsSaving(true);

        const emailList = localEmails.map((r) => r.value);

        try {
            const res = await fetchFn('/api/user-emails', {
                method: 'POST',
                body: JSON.stringify(emailList),
            });
            if (res.ok) {
                updateEmails(emailList);
            }
        } catch (error) {
            console.error('Error saving emails:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!userProfile) {
        return <div className="p-4 text-center">Loading profile...</div>;
    }

    return (
        <div className={`space-y-6`}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Profile Details</h2>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Avatar className="size-14">
                                <AvatarImage src={userProfile.profile_photo_url} alt={userProfile.full_name} />
                                <AvatarFallback className="text-lg">
                                    {userProfile.full_name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none text-muted-foreground">Full Name</h4>
                                <p className="text-sm font-medium">{userProfile.full_name}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none text-muted-foreground">Position</h4>
                                <p className="text-sm font-medium">{userProfile.position}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none text-muted-foreground">Company Email</h4>
                                <p className="text-sm font-medium">{userProfile.company_email}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none text-muted-foreground">Phone Number</h4>
                                <p className="text-sm font-medium">{userProfile.phone_number}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none text-muted-foreground">Legal Business Name</h4>
                                <p className="text-sm font-medium">{userProfile.legal_business_name}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none text-muted-foreground">Trade Registration Number</h4>
                                <p className="text-sm font-medium">{userProfile.trade_registration_number}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none text-muted-foreground">National Address</h4>
                                <p className="text-sm font-medium">{userProfile.national_address}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none text-muted-foreground">National ID</h4>
                                <p className="text-sm font-medium">{userProfile.national_id}</p>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-medium leading-none text-muted-foreground">Registered on</h4>
                                <p className="text-sm font-medium">
                                    {new Date(userProfile.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Commercial Registration</span>
                            </div>
                            {userProfile.commercial_registration_url ? (
                                <a href={userProfile.commercial_registration_url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm">View</Button>
                                </a>
                            ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">VAT Certificate</span>
                            </div>
                            {userProfile.vat_certificate_url ? (
                                <a href={userProfile.vat_certificate_url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm">View</Button>
                                </a>
                            ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">National Address</span>
                            </div>
                            {userProfile.national_address_doc_url ? (
                                <a href={userProfile.national_address_doc_url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="sm">View</Button>
                                </a>
                            ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Employee Emails</CardTitle>
                    <Button onClick={handleAddRow} size="sm" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Email
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                        {localEmails.length > 0 ? (
                            localEmails.map((row) => (
                                <div key={row.id} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 p-2 rounded-lg border bg-card text-card-foreground shadow-sm">
                                        {row.isEdit ? (
                                            <>
                                                <Input
                                                    value={row.value}
                                                    onChange={(e) => handleInputChange(row.id, e.target.value)}
                                                    placeholder="Enter employee email"
                                                    className="flex-1 h-8"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleSaveRow(row.id);
                                                        } else if (e.key === 'Escape') {
                                                            handleCancelEdit(row.id);
                                                        }
                                                    }}
                                                    autoFocus
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleSaveRow(row.id)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleCancelEdit(row.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="flex-1 text-sm px-2">{row.value}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => handleEditRow(row.id)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                                    onClick={() => handleDeleteRow(row.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    {row.error && (
                                        <p className="text-xs text-red-500 px-2">{row.error}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                No employee emails added yet
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end border-t mt-4">
                        <Button onClick={handleSaveEmails} disabled={isSaving || localEmails.some(r => r.isEdit)}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
