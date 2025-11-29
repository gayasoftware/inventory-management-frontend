import { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Package, Search, X } from 'lucide-react';
import { getProducts, createOrder, Product, OrderItem } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const Shop = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                toast.error('Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const addToCart = (product: Product) => {
        if (!product.skus || product.skus.length === 0) {
            toast.error('Product has no SKUs available');
            return;
        }
        // Default to first SKU for simplicity in this demo
        const sku = product.skus[0];

        setCart(prev => {
            const existing = prev.find(item => item.sku_id === sku.id);
            if (existing) {
                return prev.map(item =>
                    item.sku_id === sku.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            // Note: OrderItem doesn't strictly have product_name/sku_code in services.ts, 
            // but we use them for display here. In a real app, we'd extend the type.
            // For now, we cast or just use it as is since JS allows it, but TS might complain.
            // To fix TS properly, we should define a CartItem type.
            return [...prev, {
                sku_id: sku.id,
                quantity: 1,
                price: sku.price,
                // @ts-ignore
                sku_code: sku.sku_code,
                // @ts-ignore
                product_name: product.name,
                id: 0, // Placeholder
                order_id: 0 // Placeholder
            }];
        });
        toast.success('Added to cart');
        setIsCartOpen(true);
    };

    const removeFromCart = (skuId: number) => {
        setCart(prev => prev.filter(item => item.sku_id !== skuId));
    };

    const updateQuantity = (skuId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.sku_id === skuId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const checkout = async () => {
        if (!user) {
            toast.error('Please login to checkout');
            return;
        }
        if (!user.addresses || user.addresses.length === 0) {
            toast.error('Please add a delivery address in your profile');
            return;
        }
        try {
            await createOrder({
                order_items: cart.map(({ sku_id, quantity, price }) => ({ sku_id, quantity, price, id: 0, order_id: 0 })),
                shipping_address: user.addresses[0]
            });
            toast.success('Order placed successfully!');
            setCart([]);
            setIsCartOpen(false);
        } catch (error) {
            toast.error('Failed to place order');
        }
    };

    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="relative min-h-screen animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
                    <p className="text-gray-500 mt-1">Discover our premium collection.</p>
                </div>
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                >
                    <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Search */}
            <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="input-field pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                    <div
                        key={product.id}
                        className="glass-panel rounded-2xl overflow-hidden card-hover group flex flex-col h-full animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative overflow-hidden">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-48 flex items-center justify-center bg-gray-50 text-gray-300">
                                    <Package size={48} />
                                </div>
                            )}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm">
                                    {product.brand}
                                </span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                <span className="text-xl font-bold text-primary-600">
                                    INR {product.skus?.[0]?.price.toFixed(2) || 'N/A'}
                                </span>
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={!product.skus?.length}
                                    className="btn-primary flex items-center text-sm px-3 py-2"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cart Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out",
                isCartOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Your Cart
                        </h2>
                        <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cart.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <ShoppingCart className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">Your cart is empty</p>
                                <button onClick={() => setIsCartOpen(false)} className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.sku_id} className="flex gap-4 bg-gray-50 p-3 rounded-xl">
                                    <div className="h-20 w-20 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                                        <Package className="text-gray-300 w-8 h-8" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {/* @ts-ignore */}
                                        <h4 className="font-medium text-gray-900 truncate">{item.product_name}</h4>
                                        {/* @ts-ignore */}
                                        <p className="text-sm text-gray-500 mb-2">{item.sku_code}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => updateQuantity(item.sku_id, -1)} className="p-1 hover:bg-white rounded-md transition-colors">
                                                    <Minus className="w-4 h-4 text-gray-500" />
                                                </button>
                                                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.sku_id, 1)} className="p-1 hover:bg-white rounded-md transition-colors">
                                                    <Plus className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                            <p className="font-bold text-gray-900">INR {(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.sku_id)} className="text-gray-400 hover:text-red-500 self-start">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-500">Total</span>
                                <span className="text-2xl font-bold text-gray-900">INR {totalAmount.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={checkout}
                                className="w-full btn-primary py-3 text-lg shadow-lg shadow-primary-500/20"
                            >
                                Checkout Now
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay */}
            {isCartOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm"
                    onClick={() => setIsCartOpen(false)}
                />
            )}
        </div>
    );
};

export default Shop;
