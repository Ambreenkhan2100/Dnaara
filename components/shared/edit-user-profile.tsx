'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/store/useUserStore';
import { useLoader } from '@/components/providers/loader-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Loader2, Upload, FileText } from 'lucide-react';

interface EditUserProfileProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditUserProfile({ open, onOpenChange }: EditUserProfileProps) {
    const { userProfile, setUserProfile } = useUserStore();
    const { fetchFn } = useLoader();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        position: '',
        company_email: '',
        phone_number: '',
        legal_business_name: '',
        trade_registration_number: '',
        national_address: '',
        national_id: '',
        profile_photo_url: '',
        commercial_registration_url: '',
        vat_certificate_url: '',
        national_address_doc_url: '',
        national_id_doc_url: '',
    });

    useEffect(() => {
        if (userProfile && open) {
            setFormData({
                full_name: userProfile.full_name || '',
                position: userProfile.position || '',
                company_email: userProfile.company_email || '',
                phone_number: userProfile.phone_number || '',
                legal_business_name: userProfile.legal_business_name || '',
                trade_registration_number: userProfile.trade_registration_number || '',
                national_address: userProfile.national_address || '',
                national_id: userProfile.national_id || '',
                profile_photo_url: userProfile.profile_photo_url || '',
                commercial_registration_url: userProfile.commercial_registration_url || '',
                vat_certificate_url: userProfile.vat_certificate_url || '',
                national_address_doc_url: userProfile.national_address_doc_url || '',
                national_id_doc_url: userProfile.national_id_doc_url || '',
            });
        }
    }, [userProfile, open]);

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = async (key: keyof typeof formData, file: File | null) => {
        if (file) {
            try {
                const base64 = await convertFileToBase64(file);
                setFormData(prev => ({ ...prev, [key]: base64 }));
            } catch (error) {
                console.error('Error converting file:', error);
                toast.error('Failed to process file');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetchFn('/api/user-profile', {
                method: 'PUT',
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedProfile = await res.json();

            // Merge the updated profile with existing data (to keep emails etc if not returned)
            if (userProfile) {
                setUserProfile({
                    ...userProfile,
                    ...updatedProfile
                });
            } else {
                setUserProfile(updatedProfile);
            }

            toast.success('Profile updated successfully');
            onOpenChange(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFileInput = (id: string, label: string, key: keyof typeof formData) => (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex items-center gap-2">
                <Input
                    id={id}
                    type="file"
                    className="cursor-pointer"
                    onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                {formData[key] && !formData[key].startsWith('data:') && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>Current File</span>
                    </div>
                )}
            </div>
            {formData[key] && formData[key].startsWith('data:') && (
                <p className="text-xs text-green-600">New file selected</p>
            )}
        </div>
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="min-w-fit max-w-fit overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Edit Profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you're done.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 p-6 min-w-4xl">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                placeholder="Enter full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="position">Position</Label>
                            <Input
                                id="position"
                                value={formData.position}
                                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                                placeholder="Enter position"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company_email">Company Email</Label>
                            <Input
                                id="company_email"
                                type="email"
                                value={formData.company_email}
                                onChange={(e) => setFormData(prev => ({ ...prev, company_email: e.target.value }))}
                                placeholder="Enter company email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input
                                id="phone_number"
                                value={formData.phone_number}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="national_id">National ID</Label>
                            <Input
                                id="national_id"
                                value={formData.national_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, national_id: e.target.value }))}
                                placeholder="Enter national ID"
                            />
                        </div>

                        {renderFileInput('profile_photo', 'Profile Photo', 'profile_photo_url')}
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-medium text-muted-foreground">Business Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="legal_business_name">Legal Business Name</Label>
                            <Input
                                id="legal_business_name"
                                value={formData.legal_business_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, legal_business_name: e.target.value }))}
                                placeholder="Enter legal business name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="trade_registration_number">Trade Registration Number</Label>
                            <Input
                                id="trade_registration_number"
                                value={formData.trade_registration_number}
                                onChange={(e) => setFormData(prev => ({ ...prev, trade_registration_number: e.target.value }))}
                                placeholder="Enter trade registration number"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="national_address">National Address</Label>
                            <Input
                                id="national_address"
                                value={formData.national_address}
                                onChange={(e) => setFormData(prev => ({ ...prev, national_address: e.target.value }))}
                                placeholder="Enter national address"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-medium text-muted-foreground">Documents</h3>

                        {renderFileInput('commercial_registration', 'Commercial Registration', 'commercial_registration_url')}
                        {renderFileInput('vat_certificate', 'VAT Certificate', 'vat_certificate_url')}
                        {renderFileInput('national_address_doc', 'National Address Document', 'national_address_doc_url')}
                        {renderFileInput('national_id_doc', 'National ID Document', 'national_id_doc_url')}
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
