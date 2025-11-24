'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, Wallet, Bell, TrendingUp, Package, Building2, CreditCard } from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: any;
}

const adminNavItems: NavItem[] = [
    { title: 'Shipments', href: '/admin/shipments', icon: Package },
    { title: 'Agents', href: '/admin/agents', icon: Users },
    { title: 'Importers', href: '/admin/importers', icon: Building2 },
    { title: 'Payments', href: '/admin/payments', icon: CreditCard },
    { title: 'Balance', href: '/admin/balance', icon: Wallet },
    { title: 'Reports', href: '/admin/reports', icon: TrendingUp },
    { title: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const importerNavItems: NavItem[] = [];

const agentNavItems: NavItem[] = [];

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

