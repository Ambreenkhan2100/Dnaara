'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';


export interface FilterState {
    type?: 'Air' | 'Sea' | 'Land' | 'all';
    agentId?: string;
    dateRange?: DateRange;
}

interface Agent {
    id: string;
    name: string;
}

interface ShipmentFilterProps {
    agents: Agent[];
    onFilterChange: (filters: FilterState) => void;
    initialFilters?: FilterState;
    className?: string;
    entityLabel?: string;
}

export function ShipmentFilter({
    agents,
    onFilterChange,
    initialFilters,
    className,
    entityLabel = "Agent",
}: ShipmentFilterProps) {
    const [open, setOpen] = React.useState(false);
    const [filters, setFilters] = React.useState<FilterState>(
        initialFilters || { type: 'all' }
    );

    const handleApply = () => {
        onFilterChange(filters);
        setOpen(false);
    };

    const handleClear = () => {
        const newFilters: FilterState = { type: 'all', agentId: undefined, dateRange: undefined };
        setFilters(newFilters);
        onFilterChange(newFilters);
        setOpen(false);
    };

    const activeFilterCount = [
        filters.type && filters.type !== 'all',
        filters.agentId,
        filters.dateRange?.from,
    ].filter(Boolean).length;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-8 border-dashed", className)}>
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    {activeFilterCount > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden"
                            >
                                {activeFilterCount}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {activeFilterCount > 2 ? (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal"
                                    >
                                        {activeFilterCount} selected
                                    </Badge>
                                ) : (
                                    <>
                                        {filters.type && filters.type !== 'all' && (
                                            <Badge
                                                variant="secondary"
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {filters.type}
                                            </Badge>
                                        )}
                                        {filters.agentId && (
                                            <Badge
                                                variant="secondary"
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {entityLabel}
                                            </Badge>
                                        )}
                                        {filters.dateRange?.from && (
                                            <Badge
                                                variant="secondary"
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                Date
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-4" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Filters</h4>
                        <p className="text-sm text-muted-foreground">
                            Refine the shipment list.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Shipment Type</Label>
                            <Select
                                value={filters.type || 'all'}
                                onValueChange={(value: 'Air' | 'Sea' | 'Land' | 'all') =>
                                    setFilters({ ...filters, type: value })
                                }
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="Air">Air</SelectItem>
                                    <SelectItem value="Sea">Sea</SelectItem>
                                    <SelectItem value="Land">Land</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="agent">{entityLabel}</Label>
                            <Select
                                value={filters.agentId || 'all'}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, agentId: value === 'all' ? undefined : value })
                                }
                            >
                                <SelectTrigger id="agent">
                                    <SelectValue placeholder={`Select ${entityLabel.toLowerCase()}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All {entityLabel}s</SelectItem>
                                    {agents.map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id}>
                                            {agent.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Date Range</Label>
                            <div className="grid gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !filters.dateRange && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.dateRange?.from ? (
                                                filters.dateRange.to ? (
                                                    <>
                                                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                                                        {format(filters.dateRange.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(filters.dateRange.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick a date range</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={filters.dateRange?.from}
                                            selected={filters.dateRange}
                                            onSelect={(range) =>
                                                setFilters({ ...filters, dateRange: range })
                                            }
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between pt-2">
                        <Button variant="ghost" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button onClick={handleApply}>Apply Filters</Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
