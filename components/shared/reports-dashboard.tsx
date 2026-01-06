'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Package, Clock, Users, Wallet, MapPin, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useLoader } from '../providers/loader-provider';
import { ShipmentStatusStats } from '@/types/shipmentStatusStats';

export function ReportsDashboard() {
    const [paymentFilter, setPaymentFilter] = useState('all');
    const { fetchFn } = useLoader();
    const [shipmentStats, setShipmentStats] = useState({
        upcoming: { count: 0, totalDutyCharges: 0 },
        confirmed: { count: 0, totalDutyCharges: 0 },
        completed: { count: 0, totalDutyCharges: 0 }
    });
    const [shipmentTypes, setShipmentTypes] = useState([]);
    const [monthlyData, setMonthlyData] = useState<{ month: string; shipments: number }[]>([]);
    const [shipmentStatusStats, setShipmentStatusStats] = useState({
        CONFIRMED: 0,
        CLEARING_IN_PROGRESS: 0,
        IN_TRANSIT: 0,
        AT_PORT: 0,
        PENDING_DOCS: 0,
        ON_HOLD_BY_CUSTOMS: 0,
        REJECTED: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiCalls = [
                    // Shipment summary
                    fetchFn('/api/reports/shipments-summary')
                        .then(response => response.json())
                        .then(data => {
                            setShipmentStats({
                                upcoming: data.upcoming,
                                confirmed: data.confirmed,
                                completed: data.completed
                            });
                        }),

                    // Shipment types
                    fetchFn('/api/reports/shipment-type-distribution')
                        .then(response => response.json())
                        .then(typesData => {
                            setShipmentTypes(typesData.map((item: any) => ({
                                type: item.type,
                                count: item.count
                            })));
                        }),

                    // Monthly data
                    fetchFn('/api/reports/shipments-over-time')
                        .then(response => response.json())
                        .then(monthlyData => {
                            setMonthlyData(monthlyData.map((item: any) => ({
                                month: item.month,
                                shipments: item.count
                            })));
                        }),

                    // Shipments by status
                    fetchFn('/api/reports/shipments-by-status')
                        .then(response => response.json())
                        .then(statusData => {
                            const statusStats = statusData.reduce((acc: ShipmentStatusStats, item: any) => {
                                const status = item.status?.toUpperCase() || 'PENDING_DOCS';
                                acc[status] = item.count;
                                return acc;
                            }, {} as ShipmentStatusStats);

                            setShipmentStatusStats(prev => ({
                                ...prev,
                                ...statusStats
                            }));
                        })
                ];

                await Promise.all(apiCalls);

            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        };

        fetchData();
    }, [fetchFn]);

    const maxShipments = Math.max(...monthlyData.map(d => d.shipments));

    // Payments Tab Data
    const paymentStats = {
        total: { requested: 'SAR 150,000', confirmed: 'SAR 450,000', completed: 'SAR 2.1M' },
        customsDuty: { requested: 'SAR 45,000', confirmed: 'SAR 120,000', completed: 'SAR 850,000' },
    };

    // Agents Tab Data
    const agentStats = {
        totalAgents: 12,
        totalWalletBalance: 'SAR 24,500',
        totalRefilled: 'SAR 150,000',
        totalOutstanding: 'SAR 12,000',
    };

    const topAgents = [
        { name: 'Ahmed Al-Rashid', shipments: 45, rating: 4.9, color: 'bg-primary' },
        { name: 'Fatima Al-Qasim', shipments: 38, rating: 4.8, color: 'bg-purple-500' },
        { name: 'Mohammed Al-Saud', shipments: 32, rating: 4.7, color: 'bg-blue-500' }
    ];

    const mostUsedRoute = { route: 'Jeddah → Riyadh', count: 56 };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Reports & Analytics</h2>
                <p className="text-muted-foreground">Comprehensive overview of operations</p>
            </div>

            <Tabs defaultValue="shipments" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="shipments">Shipments</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="agents">Agents</TabsTrigger>
                </TabsList>

                {/* --- Shipments Tab --- */}
                <TabsContent value="shipments" className="space-y-6">
                    {/* Top Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Shipments</CardTitle>
                                <Clock className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{shipmentStats.upcoming.count}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    <span className="block">In Transit: {shipmentStats.upcoming.count}</span>
                                    <span className="block">Exp. Duty: {shipmentStats.upcoming.totalDutyCharges}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed Shipments</CardTitle>
                                <Package className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{shipmentStats.confirmed.count}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    <span className="block">Total Confirmed: {shipmentStats.confirmed.count}</span>
                                    <span className="block">Duty Confirmed: {shipmentStats.confirmed.totalDutyCharges}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Completed Shipments</CardTitle>
                                <TrendingUp className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{shipmentStats.completed.count}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    <span className="block">Total Completed: {shipmentStats.completed.count}</span>
                                    <span className="block">Total Duty Paid: {shipmentStats.completed.totalDutyCharges}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Graphs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipment Type Distribution</CardTitle>
                                <CardDescription>Breakdown by transport mode</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={shipmentTypes} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="type" type="category" width={50} />
                                        <RechartsTooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="count" fill="#0bad85" radius={[0, 4, 4, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Shipments Over Time</CardTitle>
                                <CardDescription>Last 6 months</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0bad85" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#0bad85" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="shipments" stroke="#0bad85" fillOpacity={1} fill="url(#colorShipments)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipment Status Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                                    <p className="text-2xl font-bold">{shipmentStatusStats.IN_TRANSIT || 0}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">At Port</p>
                                    <p className="text-2xl font-bold">{shipmentStatusStats.AT_PORT || 0}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Pending Docs</p>
                                    <p className="text-2xl font-bold">{shipmentStatusStats.PENDING_DOCS || 0}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Held at Customs</p>
                                    <p className="text-2xl font-bold text-orange-500">{shipmentStatusStats.ON_HOLD_BY_CUSTOMS || 0}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                                    <p className="text-2xl font-bold text-red-500">{shipmentStatusStats.REJECTED || 0}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Clearing In Progress</p>
                                    <p className="text-2xl font-bold text-red-500">{shipmentStatusStats.CLEARING_IN_PROGRESS || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Payments Tab --- */}
                <TabsContent value="payments" className="space-y-6">
                    <div className="flex justify-end">
                        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Shipments</SelectItem>
                                <SelectItem value="air">Air</SelectItem>
                                <SelectItem value="sea">Sea</SelectItem>
                                <SelectItem value="land">Land</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Amount</CardTitle>
                                <CardDescription>Overall financial overview</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-muted-foreground">Requested</span>
                                    <span className="font-bold text-lg">{paymentStats.total.requested}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-muted-foreground">Confirmed</span>
                                    <span className="font-bold text-lg text-blue-600">{paymentStats.total.confirmed}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Completed</span>
                                    <span className="font-bold text-lg text-green-600">{paymentStats.total.completed}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Customs Duty</CardTitle>
                                <CardDescription>Duty specific payments</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-muted-foreground">Requested</span>
                                    <span className="font-bold text-lg">{paymentStats.customsDuty.requested}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-muted-foreground">Confirmed</span>
                                    <span className="font-bold text-lg text-blue-600">{paymentStats.customsDuty.confirmed}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Completed</span>
                                    <span className="font-bold text-lg text-green-600">{paymentStats.customsDuty.completed}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- Agents Tab --- */}
                <TabsContent value="agents" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Agents</CardTitle>
                                <Users className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{agentStats.totalAgents}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Wallet Balance</CardTitle>
                                <Wallet className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{agentStats.totalWalletBalance}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Refilled</CardTitle>
                                <TrendingUp className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{agentStats.totalRefilled}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{agentStats.totalOutstanding}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Performing Agents</CardTitle>
                                <CardDescription>Based on shipment volume and rating</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {topAgents.map((agent, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-full ${agent.color} flex items-center justify-center text-white font-bold`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{agent.name}</p>
                                                <p className="text-xs text-muted-foreground">{agent.shipments} shipments</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                            {agent.rating}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Most Used Route</CardTitle>
                                <CardDescription>Highest volume shipping lane</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                                    <MapPin className="h-12 w-12 text-primary" />
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{mostUsedRoute.route}</p>
                                        <p className="text-muted-foreground">{mostUsedRoute.count} shipments total</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
