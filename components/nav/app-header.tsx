'use client';

import { useRouter } from 'next/navigation';
import { useRoleStore } from '@/lib/store/useRoleStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ROLE_KEYS } from '@/lib/constants';
import { toast } from 'sonner';

export function AppHeader() {
    const router = useRouter();
    const { currentRole, setRole, clearRole } = useRoleStore();

    const handleRoleSwitch = (role: typeof ROLE_KEYS[number], userId: string) => {
        setRole(role, userId);
        toast.success(`Switched to ${role} role`);
        router.push(`/${role}`);
    };

    const handleLogout = () => {
        clearRole();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    const getRoleDisplayName = (role: string | null) => {
        if (!role) return 'No Role';
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-6">
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
                <div className="flex items-center gap-4">
                    {currentRole ? (
                        <>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Switch Role
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Switch Role</SheetTitle>
                                        <SheetDescription>Select a role to switch to</SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-6 space-y-2">
                                        <Button
                                            variant={currentRole === 'admin' ? 'default' : 'outline'}
                                            className="w-full justify-start"
                                            onClick={() => handleRoleSwitch('admin', 'a1')}
                                            style={currentRole === 'admin' ? { backgroundColor: '#0bad85' } : {}}
                                        >
                                            Admin
                                        </Button>
                                        <Button
                                            variant={currentRole === 'importer' ? 'default' : 'outline'}
                                            className="w-full justify-start"
                                            onClick={() => handleRoleSwitch('importer', 'i1')}
                                            style={currentRole === 'importer' ? { backgroundColor: '#0bad85' } : {}}
                                        >
                                            Importer
                                        </Button>
                                        <Button
                                            variant={currentRole === 'agent' ? 'default' : 'outline'}
                                            className="w-full justify-start"
                                            onClick={() => handleRoleSwitch('agent', 'ag1')}
                                            style={currentRole === 'agent' ? { backgroundColor: '#0bad85' } : {}}
                                        >
                                            Agent
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <Avatar>
                                <AvatarFallback>
                                    {currentRole?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
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

