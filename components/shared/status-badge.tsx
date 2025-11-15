'use client';

import { Badge } from '@/components/ui/badge';
import type { RequestStatus } from '@/lib/status';

interface StatusBadgeProps {
    status: RequestStatus | 'active' | 'pending' | 'disabled';
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
        UPCOMING: 'secondary',
        PENDING: 'outline',
        CONFIRMED: 'default',
        COMPLETED: 'default',
        active: 'default',
        pending: 'outline',
        disabled: 'destructive',
    };

    const colorMap: Record<string, string> = {
        UPCOMING: 'bg-gray-100 text-gray-700',
        PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        CONFIRMED: 'bg-blue-100 text-blue-700',
        COMPLETED: 'bg-green-100 text-green-700',
        active: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        disabled: 'bg-red-100 text-red-700',
    };

    return (
        <Badge
            variant={variantMap[status] || 'default'}
            className={`${colorMap[status] || ''} ${className || ''}`}
        >
            {status}
        </Badge>
    );
}

