'use client';

import { useRouter } from 'next/navigation';
import { useRoleStore } from '@/lib/store/useRoleStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { useLoader } from '../providers/loader-provider';
import { UseProfile } from '@/types';
import { Plus, Check, X, Trash2, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/hooks/useNotifications';

export function AppHeader() {
    const router = useRouter();
    const { currentRole, clearRole } = useRoleStore();
    const { userProfile, setUserProfile, clearUserProfile, updateEmails } = useUserStore();

    const { fetchFn } = useLoader();

    // Remove local state
    // const [userProfile, setUserProfile] = useState<UseProfile | null>(null);
    const { notifications: liveNotifications } = useNotifications(userProfile?.user_id || null);

    const handleNotificationClick = () => {
        if (userProfile?.role) {
            router.push(`/${userProfile.role}/notifications`);
        }
    };


    useEffect(() => {
        getUserProfile();
    }, []);

    const getUserProfile = async () => {
        const res = await fetchFn('/api/user-profile');
        if (res.ok) {
            const data = await res.json();
            setUserProfile(data);
        }
    };

    const [isAddingEmail, setIsAddingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    const handleAddEmail = async () => {
        if (!newEmail || !userProfile) return;

        const updatedEmails = [...(userProfile.emails || []), newEmail];

        try {
            const res = await fetchFn('/api/user-emails', {
                method: 'POST',
                body: JSON.stringify(updatedEmails),
            });

            if (res.ok) {
                updateEmails(updatedEmails);
                setIsAddingEmail(false);
                setNewEmail('');
            }
        } catch (error) {
            console.error('Error adding email:', error);
        }
    };

    const handleDeleteEmail = async (emailToDelete: string) => {
        if (!userProfile) return;

        try {
            const res = await fetchFn('/api/user-emails', {
                method: 'DELETE',
                body: JSON.stringify({ email: emailToDelete }),
            });

            if (res.ok) {
                const updatedEmails = userProfile.emails.filter(e => e !== emailToDelete);
                updateEmails(updatedEmails);
            }
        } catch (error) {
            console.error('Error deleting email:', error);
        }
    };

    const handleLogout = () => {
        clearRole();
        clearUserProfile();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    const getRoleDisplayName = (role: string | null) => {
        if (!role) return 'No Role';
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 mx-auto">
            <div className="container flex h-16 items-center justify-between px-6 mx-auto">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold" style={{ color: '#0bad85' }}>
                        Dnaara
                    </h1>
                    {currentRole && (
                        <Badge variant="outline" className="capitalize">
                            {getRoleDisplayName(currentRole)}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {currentRole ? (
                        <>
                            {userProfile && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="relative"
                                        onClick={handleNotificationClick}
                                    >
                                        <Bell className="h-5 w-5" />
                                        {liveNotifications.length > 0 && (
                                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                                                {liveNotifications.length > 9 ? '9+' : liveNotifications.length}
                                            </span>
                                        )}
                                    </Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                                                <AvatarFallback>
                                                    {userProfile.full_name?.charAt(0).toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px]">
                                            <DialogHeader>
                                                <DialogTitle>Profile Details</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-6 py-4">
                                                <div className="grid grid-cols-2 gap-4">
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

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-medium leading-none text-muted-foreground">Employee Emails</h4>
                                                        {!isAddingEmail && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => setIsAddingEmail(true)}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {isAddingEmail && (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                value={newEmail}
                                                                onChange={(e) => setNewEmail(e.target.value)}
                                                                placeholder="Enter email"
                                                                className="h-8 text-sm"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={handleAddEmail}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => {
                                                                    setIsAddingEmail(false);
                                                                    setNewEmail('');
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {userProfile.emails && userProfile.emails.length > 0 ? (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {userProfile.emails.map((email, index) => (
                                                                <div key={index} className="flex items-center justify-between rounded-md border p-2 text-sm group">
                                                                    <span>{email}</span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                        onClick={() => handleDeleteEmail(email)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        !isAddingEmail && (
                                                            <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                                                                No employee emails found
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </>
                            )}
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/')}
                        >
                            Home
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}

