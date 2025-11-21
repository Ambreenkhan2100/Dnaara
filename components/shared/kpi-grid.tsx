'use client';

import { cn } from '@/lib/utils';

interface KPIGridProps {
    children: React.ReactNode;
    className?: string;
}

export function KPIGrid({ children, className }: KPIGridProps) {
    return (
        <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
            {children}
        </div>
    );
}

