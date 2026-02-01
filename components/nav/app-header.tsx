'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useRoleStore } from '@/lib/store/useRoleStore';
import { useUserStore } from '@/lib/store/useUserStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { useEffect, useState } from 'react';
import { useLoader } from '../providers/loader-provider';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouterWithLoader } from '@/hooks/use-router-with-loader';
import { tr } from 'date-fns/locale';


export function AppHeader() {
    const router = useRouterWithLoader();
    const path = usePathname();
    const { currentRole, clearRole } = useRoleStore();
    const { userProfile, setUserProfile, clearUserProfile } = useUserStore();

    const { fetchFn } = useLoader();

    const { notifications: liveNotifications } = useNotifications(userProfile?.user_id || null);

    const handleNotificationClick = () => {
        if (userProfile?.role) {
            router.push(`/${userProfile.role}/notifications`);
        }
    };


    useEffect(() => {
        getUserProfile();
    }, [path]);

    const getUserProfile = async () => {
        try {
            const res = await fetchFn('/api/user-profile');
            if (res.ok) {
                const data = await res.json();
                setUserProfile(data);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
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
                    {currentRole && (
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
                                    <Avatar
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => router.push(`/${userProfile.role}/profile`)}
                                    >
                                        <AvatarFallback>
                                            {userProfile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </>
                            )}
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

