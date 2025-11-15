'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { FileInput } from '@/components/shared/file-input';
import { toast } from 'sonner';
import { agents } from '@/lib/mock/users';
import { Download, FileText } from 'lucide-react';

export default function AgentProfilePage() {
    const agent = agents[0]; // Mock: should get from store based on current user
    const [formData, setFormData] = useState({
        companyName: agent.companyName,
        name: agent.name,
        phone: agent.phone || '',
        email: agent.email,
        commercialLicenseNumber: agent.commercialLicenseNumber,
        commercialLicense: agent.documents?.commercialLicenseUrl || '',
        tradeLicense: agent.documents?.tradeLicenseUrl || '',
        profilePicture: agent.documents?.profilePictureUrl || '',
    });

    const handleSave = () => {
        toast.success('Profile updated (mock)');
    };

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/agent">Agent</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Profile</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground">View and manage your profile information</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Company Name</label>
                            <p className="text-sm">{formData.companyName}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Authorized Person</label>
                            <p className="text-sm">{formData.name}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <p className="text-sm">{formData.phone || '—'}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <p className="text-sm">{formData.email}</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Commercial License Number</label>
                            <p className="text-sm">{formData.commercialLicenseNumber}</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold">Documents</h3>
                        <div className="space-y-3">
                            {formData.commercialLicense && (
                                <div className="flex items-center justify-between p-3 border rounded">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Commercial License</span>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            )}
                            {formData.tradeLicense && (
                                <div className="flex items-center justify-between p-3 border rounded">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Trade License</span>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            )}
                            {!formData.commercialLicense && !formData.tradeLicense && (
                                <p className="text-sm text-muted-foreground">No documents uploaded</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

