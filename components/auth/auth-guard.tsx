'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useRoleStore } from '@/lib/store/useRoleStore';
import { RoleKey } from '@/lib/constants';

interface AuthGuardProps {
    children?: React.ReactNode;
    allowedRoles?: RoleKey[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { setRole, clearRole, currentRole } = useRoleStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                clearRole();
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    const userRole = data.user.role as RoleKey;

                    // Update store
                    setRole(userRole, data.user.id);

                    // Handle role-based access control
                    if (allowedRoles && !allowedRoles.includes(userRole)) {
                        // Redirect to appropriate dashboard if trying to access unauthorized route
                        if (userRole === 'admin') router.push('/admin');
                        else if (userRole === 'importer') router.push('/importer');
                        else if (userRole === 'agent') router.push('/agent');
                        else router.push('/login'); // Should not happen if role is valid
                        return;
                    }

                    // Handle root path redirection
                    if (pathname === '/') {
                        if (userRole === 'admin') router.push('/admin');
                        else if (userRole === 'importer') router.push('/importer');
                        else if (userRole === 'agent') router.push('/agent');
                    }

                } else {
                    clearRole();
                    router.push('/login');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                clearRole();
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router, pathname, setRole, clearRole, allowedRoles]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // If we are on the root path, we don't render children, just wait for redirect
    if (pathname === '/') {
        return null;
    }

    // If allowedRoles is set and we passed the check (or if not set), render children
    return <>{children}</>;
}
