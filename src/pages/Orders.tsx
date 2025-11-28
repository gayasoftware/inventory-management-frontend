import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, Order } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId: number, status: string) => {
        try {
            await updateOrderStatus(orderId, status);
            toast.success('Order status updated');
            fetchOrders(); // Refresh
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-orange-100 text-orange-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    <div className="text-lg">No orders found</div>
                    <div className="mt-2">Orders will appear here once you place or receive them.</div>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                                    <p className="text-gray-600">
                                        Ordered: {new Date(order.order_date).toLocaleDateString()}
                                        {order.delivery_date && (
                                            <span className="ml-4">
                                                Delivered: {new Date(order.delivery_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-gray-600">Delivery Address: {order.delivery_address}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                    <p className="text-lg font-bold text-blue-600 mt-2">
                                        Total: ${order.total_amount.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">Items:</h3>
                                <div className="space-y-1">
                                    {order.order_items.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                            <span>Item #{item.item_id}</span>
                                            <span>Qty: {item.quantity} @ ${item.price.toFixed(2)}</span>
                                            <span className="font-semibold">${(item.quantity * item.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {(user?.role === 'admin' || user?.role === 'staff') && (
                                <div className="flex space-x-2">
                                    {['pending', 'confirmed', 'shipped', 'delivered'].map(status => (
                                        status !== order.status && (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusUpdate(order.id, status)}
                                                className={`px-4 py-2 rounded text-sm font-semibold ${
                                                    order.status === status
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                }`}
                                            >
                                                Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </button>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
