'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Download } from 'lucide-react';

export default function AdminReportsPage() {
    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Reports</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div>
                <h1 className="text-3xl font-bold">Reports</h1>
                <p className="text-muted-foreground">Generate and export platform reports</p>
            </div>

            <div className="space-y-4 rounded-lg border p-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label>Date From</Label>
                        <Input type="date" />
                    </div>
                    <div className="space-y-2">
                        <Label>Date To</Label>
                        <Input type="date" />
                    </div>
                    <div className="space-y-2">
                        <Label>Importer</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="All Importers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Importers</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Agent</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="All Agents" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Agents</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button disabled>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Backend integration pending</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" disabled>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Backend integration pending</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}

