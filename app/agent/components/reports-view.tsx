'use client';
import { ReportsDashboard } from '@/components/shared/reports-dashboard';

export function ReportsView() {
    return <ReportsDashboard />;
}
// export function ReportsView() {
//     // Mock data for statistics
//     const stats = [
//         {
//             title: 'Total Shipments',
//             value: '127',
//             change: '+12%',
//             trend: 'up',
//             icon: Package,
//             color: 'text-blue-500'
//         },
//         {
//             title: 'Active Shipments',
//             value: '43',
//             change: '+8%',
//             trend: 'up',
//             icon: Ship,
//             color: 'text-green-500'
//         },
//         {
//             title: 'Total Payments',
//             value: 'SAR 2.4M',
//             change: '+15%',
//             trend: 'up',
//             icon: DollarSign,
//             color: 'text-purple-500'
//         },
//         {
//             title: 'Pending Clearance',
//             value: '18',
//             change: '-5%',
//             trend: 'down',
//             icon: Truck,
//             color: 'text-orange-500'
//         }
//     ];

//     // Mock data for shipment types
//     const shipmentTypes = [
//         { type: 'Air', count: 45, percentage: 35, color: 'bg-blue-500' },
//         { type: 'Sea', count: 62, percentage: 49, color: 'bg-green-500' },
//         { type: 'Land', count: 20, percentage: 16, color: 'bg-orange-500' }
//     ];

//     // Mock data for monthly shipments
//     const monthlyData = [
//         { month: 'Jan', shipments: 18 },
//         { month: 'Feb', shipments: 22 },
//         { month: 'Mar', shipments: 19 },
//         { month: 'Apr', shipments: 27 },
//         { month: 'May', shipments: 24 },
//         { month: 'Jun', shipments: 17 }
//     ];

//     // Mock data for payment status
//     const paymentStatus = [
//         { status: 'Requested', count: 12, amount: 'SAR 340K', color: 'bg-yellow-500' },
//         { status: 'Confirmed', count: 8, amount: 'SAR 580K', color: 'bg-blue-500' },
//         { status: 'Completed', count: 45, amount: 'SAR 1.5M', color: 'bg-green-500' }
//     ];

//     const maxShipments = Math.max(...monthlyData.map(d => d.shipments));

//     return (
//         <div className="space-y-6">
//             <div>
//                 <h2 className="text-2xl font-bold">Reports & Analytics</h2>
//                 <p className="text-muted-foreground">Overview of shipments and payments performance</p>
//             </div>

//             {/* Statistics Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {stats.map((stat, index) => (
//                     <Card key={index}>
//                         <CardHeader className="flex flex-row items-center justify-between pb-2">
//                             <CardTitle className="text-sm font-medium text-muted-foreground">
//                                 {stat.title}
//                             </CardTitle>
//                             <stat.icon className={`h-4 w-4 ${stat.color}`} />
//                         </CardHeader>
//                         <CardContent>
//                             <div className="text-2xl font-bold">{stat.value}</div>
//                             <div className="flex items-center gap-1 mt-1">
//                                 {stat.trend === 'up' ? (
//                                     <TrendingUp className="h-3 w-3 text-green-500" />
//                                 ) : (
//                                     <TrendingDown className="h-3 w-3 text-red-500" />
//                                 )}
//                                 <span className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
//                                     {stat.change}
//                                 </span>
//                                 <span className="text-xs text-muted-foreground">from last month</span>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 ))}
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Shipment Types Chart */}
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Shipment Types Distribution</CardTitle>
//                         <CardDescription>Breakdown by transport mode</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         {shipmentTypes.map((item, index) => (
//                             <div key={index} className="space-y-2">
//                                 <div className="flex items-center justify-between text-sm">
//                                     <div className="flex items-center gap-2">
//                                         {item.type === 'Air' && <Plane className="h-4 w-4" />}
//                                         {item.type === 'Sea' && <Ship className="h-4 w-4" />}
//                                         {item.type === 'Land' && <Truck className="h-4 w-4" />}
//                                         <span className="font-medium">{item.type}</span>
//                                     </div>
//                                     <span className="text-muted-foreground">{item.count} shipments</span>
//                                 </div>
//                                 <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
//                                     <div
//                                         className={`h-full ${item.color}`}
//                                         style={{ width: `${item.percentage}%` }}
//                                     />
//                                 </div>
//                                 <div className="text-xs text-muted-foreground text-right">
//                                     {item.percentage}%
//                                 </div>
//                             </div>
//                         ))}
//                     </CardContent>
//                 </Card>

//                 {/* Monthly Shipments Chart */}
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Shipments Over Time</CardTitle>
//                         <CardDescription>Last 6 months performance</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="flex items-end justify-between h-64 gap-2">
//                             {monthlyData.map((data, index) => (
//                                 <div key={index} className="flex-1 flex flex-col items-center gap-2">
//                                     <div className="w-full flex flex-col items-center justify-end" style={{ height: '200px' }}>
//                                         <div className="text-xs font-medium mb-1">{data.shipments}</div>
//                                         <div
//                                             className="w-full bg-primary rounded-t"
//                                             style={{ height: `${(data.shipments / maxShipments) * 100}%` }}
//                                         />
//                                     </div>
//                                     <div className="text-xs text-muted-foreground">{data.month}</div>
//                                 </div>
//                             ))}
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>

//             {/* Payment Status Overview */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle>Payment Status Overview</CardTitle>
//                     <CardDescription>Current payment requests breakdown</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         {paymentStatus.map((item, index) => (
//                             <div key={index} className="rounded-lg border p-4 space-y-2">
//                                 <div className="flex items-center justify-between">
//                                     <span className="text-sm font-medium">{item.status}</span>
//                                     <div className={`h-3 w-3 rounded-full ${item.color}`} />
//                                 </div>
//                                 <div className="text-2xl font-bold">{item.count}</div>
//                                 <div className="text-sm text-muted-foreground">{item.amount}</div>
//                             </div>
//                         ))}
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Recent Activity Summary */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle>Quick Insights</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                             <p className="text-sm font-medium">Top Importer This Month</p>
//                             <p className="text-2xl font-bold">Al-Mahmoud Trading</p>
//                             <p className="text-xs text-muted-foreground">15 active shipments</p>
//                         </div>
//                         <div className="space-y-2">
//                             <p className="text-sm font-medium">Average Clearance Time</p>
//                             <p className="text-2xl font-bold">4.2 days</p>
//                             <p className="text-xs text-green-500 flex items-center gap-1">
//                                 <TrendingDown className="h-3 w-3" />
//                                 12% faster than last month
//                             </p>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }
