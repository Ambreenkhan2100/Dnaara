'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Package, Ship, Plane, Truck, Clock } from 'lucide-react';

export function ReportsView() {
    // Mock data for statistics
    const stats = [
        {
            title: 'Total Shipments',
            value: '89',
            change: '+15%',
            trend: 'up',
            icon: Package,
            color: 'text-blue-500'
        },
        {
            title: 'In Transit',
            value: '24',
            change: '+5%',
            trend: 'up',
            icon: Ship,
            color: 'text-green-500'
        },
        {
            title: 'Total Spent',
            value: 'SAR 1.8M',
            change: '+18%',
            trend: 'up',
            icon: DollarSign,
            color: 'text-purple-500'
        },
        {
            title: 'Avg. Delivery Time',
            value: '5.3 days',
            change: '-8%',
            trend: 'down',
            icon: Clock,
            color: 'text-orange-500'
        }
    ];

    // Mock data for shipment types
    const shipmentTypes = [
        { type: 'Air', count: 28, percentage: 31, color: 'bg-blue-500' },
        { type: 'Sea', count: 49, percentage: 55, color: 'bg-green-500' },
        { type: 'Land', count: 12, percentage: 14, color: 'bg-orange-500' }
    ];

    // Mock data for monthly shipments
    const monthlyData = [
        { month: 'Jan', shipments: 12 },
        { month: 'Feb', shipments: 16 },
        { month: 'Mar', shipments: 14 },
        { month: 'Apr', shipments: 19 },
        { month: 'May', shipments: 17 },
        { month: 'Jun', shipments: 11 }
    ];

    // Mock data for payment status
    const paymentStatus = [
        { status: 'Requested', count: 8, amount: 'SAR 240K', color: 'bg-yellow-500' },
        { status: 'Confirmed', count: 12, amount: 'SAR 420K', color: 'bg-blue-500' },
        { status: 'Completed', count: 34, amount: 'SAR 1.14M', color: 'bg-green-500' }
    ];

    // Mock data for top agents
    const topAgents = [
        { name: 'Ahmed Al-Rashid', shipments: 28, rating: '4.9', color: 'bg-primary' },
        { name: 'Fatima Al-Qasim', shipments: 22, rating: '4.8', color: 'bg-purple-500' },
        { name: 'Mohammed Al-Saud', shipments: 18, rating: '4.7', color: 'bg-blue-500' }
    ];

    const maxShipments = Math.max(...monthlyData.map(d => d.shipments));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Reports & Analytics</h2>
                <p className="text-muted-foreground">Overview of your import operations and performance</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="flex items-center gap-1 mt-1">
                                {stat.trend === 'up' ? (
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 text-red-500" />
                                )}
                                <span className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                    {stat.change}
                                </span>
                                <span className="text-xs text-muted-foreground">from last month</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shipment Types Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipment Types Distribution</CardTitle>
                        <CardDescription>Breakdown by transport mode</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {shipmentTypes.map((item, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        {item.type === 'Air' && <Plane className="h-4 w-4" />}
                                        {item.type === 'Sea' && <Ship className="h-4 w-4" />}
                                        {item.type === 'Land' && <Truck className="h-4 w-4" />}
                                        <span className="font-medium">{item.type}</span>
                                    </div>
                                    <span className="text-muted-foreground">{item.count} shipments</span>
                                </div>
                                <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color}`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <div className="text-xs text-muted-foreground text-right">
                                    {item.percentage}%
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Monthly Shipments Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipments Over Time</CardTitle>
                        <CardDescription>Last 6 months performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between h-64 gap-2">
                            {monthlyData.map((data, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex flex-col items-center justify-end" style={{ height: '200px' }}>
                                        <div className="text-xs font-medium mb-1">{data.shipments}</div>
                                        <div
                                            className="w-full bg-primary rounded-t"
                                            style={{ height: `${(data.shipments / maxShipments) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">{data.month}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Status Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Status Overview</CardTitle>
                    <CardDescription>Current payment breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {paymentStatus.map((item, index) => (
                            <div key={index} className="rounded-lg border p-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{item.status}</span>
                                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                                </div>
                                <div className="text-2xl font-bold">{item.count}</div>
                                <div className="text-sm text-muted-foreground">{item.amount}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Top Agents Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Agents</CardTitle>
                    <CardDescription>Agents handling your shipments</CardDescription>
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
                                    <p className="text-xs text-muted-foreground">{agent.shipments} shipments handled</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">⭐ {agent.rating}</Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Quick Insights */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Most Used Shipping Route</p>
                            <p className="text-2xl font-bold">Jeddah → Riyadh</p>
                            <p className="text-xs text-muted-foreground">32 shipments this month</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Average Cost per Shipment</p>
                            <p className="text-2xl font-bold">SAR 20,225</p>
                            <p className="text-xs text-green-500 flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                9% cheaper than last month
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
