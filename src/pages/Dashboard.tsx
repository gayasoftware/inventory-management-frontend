import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Package, TrendingUp, DollarSign } from 'lucide-react';
import { getItems, getTransactions, Item, Transaction } from '../api/services';
import clsx from 'clsx';

const Dashboard = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemsData, transactionsData] = await Promise.all([
                    getItems(),
                    getTransactions()
                ]);
                setItems(itemsData);
                setTransactions(transactionsData);
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
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Calculations
    const lowStockItems = items.filter(item => item.quantity <= item.reorder_level);
    const totalValue = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    // Chart Data (Last 7 days sales)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const salesData = last7Days.map(date => {
        const dayTransactions = transactions.filter(t =>
            t.type === 'sale' && t.timestamp.startsWith(date)
        );
        const totalSales = dayTransactions.reduce((acc, t) => acc + (t.price * t.quantity), 0);
        return {
            date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            sales: totalSales
        };
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Inventory Value</p>
                            <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg text-green-600">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Items in Stock</p>
                            <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <Package size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Low Stock Alerts</p>
                            <p className={clsx("text-2xl font-bold", lowStockItems.length > 0 ? "text-red-600" : "text-gray-900")}>
                                {lowStockItems.length}
                            </p>
                        </div>
                        <div className={clsx("p-3 rounded-lg", lowStockItems.length > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600")}>
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                        Weekly Sales
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Low Stock List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                        Low Stock Items
                    </h2>
                    <div className="overflow-auto max-h-80">
                        {lowStockItems.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">All stock levels are healthy.</p>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">Item</th>
                                        <th className="px-4 py-3">Quantity</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockItems.map(item => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                                            <td className="px-4 py-3">{item.quantity} / {item.reorder_level}</td>
                                            <td className="px-4 py-3">
                                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                    Critical
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
