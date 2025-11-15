'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileInput } from '@/components/shared/file-input';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { importers } from '@/lib/mock/users';

export default function ImporterProfilePage() {
    const importer = importers[0]; // Mock: should get from store based on current user
    const [formData, setFormData] = useState({
        businessName: importer.businessName,
        name: importer.name,
        phone: importer.phone || '',
        email: importer.email,
        crNumber: importer.crNumber,
        crCopy: importer.documents?.commercialRegistrationUrl || '',
        tradeLicense: '',
        chamberAuth: importer.documents?.chamberAuthUrl || '',
        profilePicture: importer.documents?.profilePictureUrl || '',
    });

    const handleSave = () => {
        toast.success('Profile updated (mock)');
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/importer">Importer</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Profile</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground">Manage your profile information</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Business Name</Label>
                            <Input
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Authorized Person</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CR Number</Label>
                            <Input
                                value={formData.crNumber}
                                onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold">Documents</h3>
                        <FileInput
                            label="CR Copy"
                            value={formData.crCopy}
                            onChange={(value) => setFormData({ ...formData, crCopy: value })}
                        />
                        <FileInput
                            label="Trade License"
                            value={formData.tradeLicense}
                            onChange={(value) => setFormData({ ...formData, tradeLicense: value })}
                        />
                        <FileInput
                            label="Chamber Authorization"
                            value={formData.chamberAuth}
                            onChange={(value) => setFormData({ ...formData, chamberAuth: value })}
                        />
                        <FileInput
                            label="Profile Picture"
                            value={formData.profilePicture}
                            onChange={(value) => setFormData({ ...formData, profilePicture: value })}
                            accept="image/*"
                        />
                    </div>

                    <Button onClick={handleSave} style={{ backgroundColor: '#0bad85' }}>
                        Save Changes
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

