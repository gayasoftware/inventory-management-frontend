import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, DollarSign, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getProducts, getOrders, Product, Order } from '../api/services';
import clsx from 'clsx';

const Dashboard = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, ordersData] = await Promise.all([
                    getProducts(),
                    getOrders()
                ]);
                setProducts(productsData);
                setOrders(ordersData);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary-500 animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-600 font-bold text-xs">
                        LOADING
                    </div>
                </div>
            </div>
        );
    }

    // Calculations
    const validOrders = orders.filter(o => ['confirmed', 'shipped', 'delivered'].includes(o.status));
    const totalRevenue = validOrders.reduce((acc, order) => acc + order.total_amount, 0);
    const totalOrdersCount = validOrders.length;
    const activeProductsCount = products.filter(p => p.is_active).length;

    // Chart Data (Last 7 days sales)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const salesData = last7Days.map(date => {
        const dayOrders = validOrders.filter(o => o.order_date.startsWith(date));
        const totalSales = dayOrders.reduce((acc, o) => acc + o.total_amount, 0);
        return {
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            sales: totalSales
        };
    });

    // Top Selling Products
    const productSales: Record<number, number> = {};
    validOrders.forEach(order => {
        order.order_items.forEach(item => {
            const product = products.find(p => p.skus?.some(s => s.id === item.sku_id));
            if (product) {
                productSales[product.id] = (productSales[product.id] || 0) + item.quantity;
            }
        });
    });

    const topProductsData = Object.entries(productSales)
        .map(([productId, quantity]) => {
            const product = products.find(p => p.id === Number(productId));
            return {
                name: product?.name || 'Unknown',
                quantity: quantity,
            };
        })
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
        <div className="glass-panel p-6 rounded-2xl card-hover relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300 text-${color}-500`}>
                <Icon size={64} />
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={clsx("flex items-center text-sm font-medium", trend > 0 ? "text-green-600" : "text-red-600")}>
                        {trend > 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="btn-secondary">Export Report</button>
                    <button className="btn-primary">
                        <Package className="w-4 h-4 mr-2 inline-block" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                <StatCard
                    title="Total Revenue"
                    value={`INR ${totalRevenue.toFixed(2)}`}
                    icon={DollarSign}
                    color="green"
                    trend={12.5}
                />
                <StatCard
                    title="Total Orders"
                    value={totalOrdersCount}
                    icon={Package}
                    color="blue"
                    trend={8.2}
                />
                <StatCard
                    title="Active Products"
                    value={activeProductsCount}
                    icon={Percent}
                    color="purple"
                    trend={-2.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Chart */}
                <div className="glass-panel p-6 rounded-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                            Revenue Analytics
                        </h2>
                        <select className="bg-gray-50 border-none text-sm font-medium text-gray-500 focus:ring-0 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="sales"
                                    fill="#3b82f6"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products Chart */}
                <div className="glass-panel p-6 rounded-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-purple-600" />
                            Top Performing Products
                        </h2>
                        <button className="text-sm text-primary-600 font-medium hover:text-primary-700">View All</button>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="quantity"
                                    fill="#a855f7"
                                    radius={[0, 6, 6, 0]}
                                    barSize={30}
                                    background={{ fill: '#f8fafc' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
