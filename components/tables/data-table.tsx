'use client';

import { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchInput } from '@/components/shared/search-input';
import { cn } from '@/lib/utils';

interface DataTableProps<T> {
    data: T[];
    columns: {
        header: string;
        accessor: keyof T | ((row: T) => React.ReactNode);
        className?: string;
    }[];
    searchKey?: keyof T;
    searchPlaceholder?: string;
    filterSlot?: React.ReactNode;
    actionsSlot?: (row: T) => React.ReactNode;
    emptyMessage?: string;
    className?: string;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    searchKey,
    searchPlaceholder = 'Search...',
    filterSlot,
    actionsSlot,
    emptyMessage = 'No data available',
    className,
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredData = useMemo(() => {
        let result = data;

        if (search && searchKey) {
            const searchLower = search.toLowerCase();
            result = result.filter((item) => {
                const value = item[searchKey];
                return value?.toString().toLowerCase().includes(searchLower);
            });
        }

        return result;
    }, [data, search, searchKey]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return filteredData.slice(start, end);
    }, [filteredData, page, pageSize]);

    const totalPages = Math.ceil(filteredData.length / pageSize);

    return (
        <div className={cn('space-y-4', className)}>
            <div className="flex items-center justify-between gap-4">
                {searchKey && (
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder={searchPlaceholder}
                        className="max-w-sm"
                    />
                )}
                {filterSlot && <div className="ml-auto">{filterSlot}</div>}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col, idx) => (
                                <TableHead key={idx} className={col.className}>
                                    {col.header}
                                </TableHead>
                            ))}
                            {actionsSlot && <TableHead className="w-[100px]">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (actionsSlot ? 1 : 0)} className="h-24 text-center">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    {columns.map((col, colIdx) => (
                                        <TableCell key={colIdx} className={col.className}>
                                            {typeof col.accessor === 'function'
                                                ? col.accessor(row)
                                                : row[col.accessor]}
                                        </TableCell>
                                    ))}
                                    {actionsSlot && (
                                        <TableCell>
                                            <div className="flex items-center gap-2">{actionsSlot(row)}</div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page</span>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                            setPageSize(Number(value));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[70px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page > 1) setPage(page - 1);
                                }}
                                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }
                            return (
                                <PaginationItem key={pageNum}>
                                    <PaginationLink
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPage(pageNum);
                                        }}
                                        isActive={page === pageNum}
                                    >
                                        {pageNum}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page < totalPages) setPage(page + 1);
                                }}
                                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}

