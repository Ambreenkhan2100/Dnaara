'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FileText, Wallet, User, Bell, TrendingUp, Calendar, CheckCircle, Clock, Building2 } from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: NavItem[] = [
    { title: 'Overview', href: '/admin', icon: LayoutDashboard },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Transactions', href: '/admin/transactions', icon: FileText },
    { title: 'Balances', href: '/admin/balances', icon: Wallet },
    { title: 'Reports', href: '/admin/reports', icon: TrendingUp },
    { title: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const importerNavItems: NavItem[] = [
    { title: 'Overview', href: '/importer', icon: LayoutDashboard },
    { title: 'Agents', href: '/importer/agents', icon: Users },
    { title: 'Upcoming', href: '/importer/upcoming', icon: Calendar },
    { title: 'Requests', href: '/importer/requests', icon: FileText },
    { title: 'Profile', href: '/importer/profile', icon: User },
    { title: 'Wallet', href: '/importer/wallet', icon: Wallet },
];

const agentNavItems: NavItem[] = [
    { title: 'Overview', href: '/agent', icon: LayoutDashboard },
    { title: 'Importers', href: '/agent/importers', icon: Building2 },
    { title: 'Upcoming', href: '/agent/upcoming', icon: Calendar },
    { title: 'Pending', href: '/agent/pending', icon: Clock },
    { title: 'Completed', href: '/agent/completed', icon: CheckCircle },
    { title: 'Profile', href: '/agent/profile', icon: User },
];

interface SideNavProps {
    role: 'admin' | 'importer' | 'agent';
}

export function SideNav({ role }: SideNavProps) {
    const pathname = usePathname();
    const navItems =
        role === 'admin'
            ? adminNavItems
            : role === 'importer'
                ? importerNavItems
                : agentNavItems;

    return (
        <nav className="w-64 border-r bg-background p-4">
            <div className="space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                            style={
                                isActive
                                    ? {
                                        backgroundColor: '#0bad85',
                                        color: 'white',
                                    }
                                    : {}
                            }
                        >
                            <Icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

