import { useEffect, useState } from 'react';
import { getOrders, getUserOrders, updateOrderStatus, Order } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, Truck, Package, XCircle, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchOrders = async () => {
        try {
            const data = (user?.role === 'admin' || user?.role === 'staff') ? await getOrders() : await getUserOrders();
            setOrders(data);
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            toast.success('Order status updated');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 mr-1" />;
            case 'confirmed': return <CheckCircle className="w-4 h-4 mr-1" />;
            case 'shipped': return <Truck className="w-4 h-4 mr-1" />;
            case 'delivered': return <Package className="w-4 h-4 mr-1" />;
            case 'cancelled': return <XCircle className="w-4 h-4 mr-1" />;
            default: return null;
        }
    };

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-500 mt-1">Track and manage customer orders.</p>
                </div>
            </div>

            <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="input-field pl-10"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <select
                        className="input-field"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 glass-panel rounded-xl">
                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-lg font-medium text-gray-900">No orders found</p>
                    </div>
                ) : (
                    filteredOrders.map((order, index) => (
                        <div
                            key={order.id}
                            className="glass-panel rounded-xl overflow-hidden animate-slide-up hover:shadow-md transition-shadow"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                                            <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", getStatusColor(order.status))}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Placed on {new Date(order.order_date).toLocaleDateString()} at {new Date(order.order_date).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                            <p className="text-xl font-bold text-primary-600">INR {order.total_amount.toFixed(2)}</p>
                                        </div>
                                        {(user?.role === 'admin' || user?.role === 'staff') && (
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                className="input-field py-1 px-3 text-sm w-auto"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                                            <ul className="space-y-3">
                                                {order.order_items.map((item) => (
                                                    <li key={item.id} className="flex justify-between text-sm">
                                                        <div className="flex items-center">
                                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium mr-3">x{item.quantity}</span>
                                                            <span className="text-gray-700">SKU: {item.sku_id}</span>
                                                        </div>
                                                        <span className="font-medium text-gray-900">INR {(item.price * item.quantity).toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Delivery Details</h4>
                                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                                <p>{order.shipping_address ? `${order.shipping_address.street_address}, ${order.shipping_address.city}` : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Orders;
