'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    compact?: boolean;
}

export function StatCard({ title, value, trend, className, compact }: StatCardProps) {
    return (
        <Card className={cn(compact && 'p-4', className)}>
            <CardHeader className={cn(compact && 'pb-2')}>
                <CardTitle className={cn('text-sm font-medium text-muted-foreground', compact && 'text-xs')}>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className={cn(compact && 'pt-0')}>
                <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold">{value}</div>
                    {trend && (
                        <div
                            className={cn(
                                'text-sm',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}
                        >
                            {trend.isPositive ? '+' : ''}{trend.value}%
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

