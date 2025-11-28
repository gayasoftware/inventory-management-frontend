import { useEffect, useState } from 'react';
import { getItems, createOrder, Item } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Shop = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [cart, setCart] = useState<{ [key: number]: number }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const data = await getItems();
                setItems(data);
            } catch (error) {
                console.error('Error fetching items:', error);
                toast.error('Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const addToCart = (itemId: number) => {
        setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    };

    const removeFromCart = (itemId: number) => {
        setCart(prev => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 0) - 1) }));
    };

    const handleCheckout = async () => {
        if (!user?.address) {
            toast.error('Please update your profile with an address before placing an order');
            return;
        }

        const orderItems = Object.entries(cart)
            .filter(([_, qty]) => qty > 0)
            .map(([itemId, qty]) => {
                const item = items.find(i => i.id === Number(itemId));
                return { item_id: Number(itemId), quantity: qty, price: item?.price || 0 };
            });

        if (orderItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        try {
            await createOrder({
                customer_id: user.id,
                delivery_address: user.address,
                order_items: orderItems,
            });
            toast.success('Order placed successfully!');
            setCart({});
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to place order');
        }
    };

    const cartItems = Object.entries(cart).filter(([_, qty]) => qty > 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Shop</h1>

            {cartItems.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-2">Your Cart:</h3>
                    <div className="space-y-1">
                        {cartItems.map(([itemId, qty]) => {
                            const item = items.find(i => i.id === Number(itemId));
                            return (
                                <div key={itemId} className="flex justify-between text-sm">
                                    <span>{item?.name} x{qty}</span>
                                    <span>${((item?.price || 0) * qty).toFixed(2)}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between font-semibold mt-4">
                        <span>Total:</span>
                        <span>
                            ${cartItems.reduce((sum, [itemId, qty]) => {
                                const item = items.find(i => i.id === Number(itemId));
                                return sum + ((item?.price || 0) * qty);
                            }, 0).toFixed(2)}
                        </span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                        Checkout
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.filter(item => item.quantity > 0).map(item => (
                    <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
                        <p className="text-gray-600 mb-4">{item.category?.name}</p>
                        <p className="text-2xl font-bold text-blue-600 mb-4">${item.price.toFixed(2)}</p>

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                                    disabled={(cart[item.id] || 0) <= 0}
                                >
                                    -
                                </button>
                                <span className="font-semibold min-w-[2rem] text-center">{cart[item.id] || 0}</span>
                                <button
                                    onClick={() => addToCart(item.id)}
                                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                                    disabled={(cart[item.id] || 0) >= item.quantity}
                                >
                                    +
                                </button>
                            </div>
                            <span className="text-sm text-gray-500">Stock: {item.quantity}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Shop;
