import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getInventoryLocations, createInventoryLocation, getStockLevels, createStockLevel, addStock, getStockMovements, InventoryLocation, StockLevel, StockMovement } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Package, TrendingUp, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface LocationFormData {
    name: string;
    type: string;
    address: string;
    pincode: string;
}

interface StockFormData {
    sku_id: number;
    location_id: number;
    quantity: number;
}

interface AddStockFormData {
    sku_id: number;
    quantity: number;
    to_location_id: number;
}

const Inventory = () => {
    const { user } = useAuth();
    const [locations, setLocations] = useState<InventoryLocation[]>([]);
    const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'locations' | 'stock' | 'movements'>('locations');

    const { register: registerLocation, handleSubmit: handleLocationSubmit, reset: resetLocation } = useForm<LocationFormData>();
    const { register: registerStock, handleSubmit: handleStockSubmit, reset: resetStock } = useForm<StockFormData>();
    const { register: registerAddStock, handleSubmit: handleAddStockSubmit, reset: resetAddStock } = useForm<AddStockFormData>();

    const fetchData = async () => {
        try {
            const [locationsData, stockData, movementsData] = await Promise.all([
                getInventoryLocations(),
                getStockLevels(),
                getStockMovements(),
            ]);
            setLocations(locationsData);
            setStockLevels(stockData);
            setMovements(movementsData);
        } catch (error: any) {
            toast.error('Failed to fetch inventory data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onLocationSubmit = async (data: LocationFormData) => {
        try {
            await createInventoryLocation(data);
            toast.success('Location created successfully');
            resetLocation();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to create location');
        }
    };

    const onStockSubmit = async (data: StockFormData) => {
        try {
            await createStockLevel(data);
            toast.success('Stock level created successfully');
            resetStock();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to create stock level');
        }
    };

    const onAddStockSubmit = async (data: AddStockFormData) => {
        try {
            await addStock({
                ...data,
                type: 'purchase'
            });
            toast.success('Stock added successfully');
            resetAddStock();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to add stock');
        }
    };

    const getMovementIcon = (type: string) => {
        switch (type) {
            case 'sale': return <ArrowUpCircle className="w-4 h-4 text-red-500" />;
            case 'purchase': return <ArrowDownCircle className="w-4 h-4 text-green-500" />;
            default: return <TrendingUp className="w-4 h-4 text-blue-500" />;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    if (user?.role !== 'admin' && user?.role !== 'staff') {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Access denied. Only staff can view inventory.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-500 mt-1">Manage locations, stock levels, and movements</p>
                </div>
            </div>

            <div className="glass-panel p-4 rounded-xl">
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setActiveTab('locations')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'locations'
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Locations
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'stock'
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Package className="w-4 h-4 inline mr-2" />
                        Stock Levels
                    </button>
                    <button
                        onClick={() => setActiveTab('movements')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === 'movements'
                                ? 'bg-primary-100 text-primary-700'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <TrendingUp className="w-4 h-4 inline mr-2" />
                        Movements
                    </button>
                </div>

                {activeTab === 'locations' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Inventory Locations</h2>
                            <button
                                onClick={() => {
                                    const modal = document.getElementById('location-modal');
                                    if (modal) (modal as HTMLDialogElement).showModal();
                                }}
                                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Location
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {locations.map((location) => (
                                <div key={location.id} className="glass-panel p-4 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-lg">{location.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            location.type === 'store'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {location.type}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm">{location.address}</p>
                                    <p className="text-gray-500 text-xs">PIN: {location.pincode}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'stock' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold">Stock Levels</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const modal = document.getElementById('add-stock-modal');
                                        if (modal) (modal as HTMLDialogElement).showModal();
                                    }}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                                    Add Stock
                                </button>
                                <button
                                    onClick={() => {
                                        const modal = document.getElementById('stock-modal');
                                        if (modal) (modal as HTMLDialogElement).showModal();
                                    }}
                                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Set Stock Level
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {stockLevels.map((stock) => (
                                <div key={stock.id} className="glass-panel p-4 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">SKU ID: {stock.sku_id}</p>
                                        <p className="text-sm text-gray-600">Location: {
                                            locations.find(l => l.id === stock.location_id)?.name || 'Unknown'
                                        }</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{stock.quantity}</p>
                                        <p className="text-sm text-gray-500">Reserved: {stock.reserved_quantity}</p>
                                        <p className="text-sm text-green-600">Available: {stock.quantity - stock.reserved_quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'movements' && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold">Stock Movements</h2>

                        <div className="space-y-4">
                            {movements.slice(0, 50).map((movement) => (
                                <div key={movement.id} className="glass-panel p-4 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getMovementIcon(movement.type)}
                                        <div>
                                            <p className="font-medium">SKU ID: {movement.sku_id}</p>
                                            <p className="text-sm text-gray-600 capitalize">{movement.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{movement.quantity}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(movement.timestamp || '').toLocaleDateString()}
                                        </p>
                                        {movement.from_location_id && (
                                            <p className="text-xs text-red-600">
                                                From: {locations.find(l => l.id === movement.from_location_id)?.name}
                                            </p>
                                        )}
                                        {movement.to_location_id && (
                                            <p className="text-xs text-green-600">
                                                To: {locations.find(l => l.id === movement.to_location_id)?.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <dialog id="location-modal" className="modal">
                <div className="modal-box max-w-2xl">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Add New Location</h3>
                    <form onSubmit={handleLocationSubmit(onLocationSubmit)} className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                {...registerLocation('name', { required: 'Name is required' })}
                                className="input-field"
                                placeholder="Location name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select {...registerLocation('type', { required: 'Type is required' })} className="input-field">
                                <option value="store">Store</option>
                                <option value="warehouse">Warehouse</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <input
                                {...registerLocation('address')}
                                className="input-field"
                                placeholder="Street address"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Pincode</label>
                            <input
                                {...registerLocation('pincode')}
                                className="input-field"
                                placeholder="Pincode"
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full">
                            Create Location
                        </button>
                    </form>
                </div>
            </dialog>

            <dialog id="stock-modal" className="modal">
                <div className="modal-box max-w-2xl">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Set Stock Level</h3>
                    <form onSubmit={handleStockSubmit(onStockSubmit)} className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">SKU ID</label>
                            <input
                                type="number"
                                {...registerStock('sku_id', { required: 'SKU ID is required' })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Location</label>
                            <select {...registerStock('location_id', { required: 'Location is required' })} className="input-field">
                                <option value="">Select location</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.id}>{location.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity</label>
                            <input
                                type="number"
                                {...registerStock('quantity', { required: 'Quantity is required', min: 0 })}
                                className="input-field"
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full">
                            Set Stock Level
                        </button>
                    </form>
                </div>
            </dialog>

            <dialog id="add-stock-modal" className="modal">
                <div className="modal-box max-w-2xl">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Add Stock (Purchase)</h3>
                    <form onSubmit={handleAddStockSubmit(onAddStockSubmit)} className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">SKU ID</label>
                            <input
                                type="number"
                                {...registerAddStock('sku_id', { required: 'SKU ID is required' })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Location</label>
                            <select {...registerAddStock('to_location_id', { required: 'Location is required' })} className="input-field">
                                <option value="">Select location</option>
                                {locations.map(location => (
                                    <option key={location.id} value={location.id}>{location.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity</label>
                            <input
                                type="number"
                                {...registerAddStock('quantity', { required: 'Quantity is required', min: 1 })}
                                className="input-field"
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full">
                            Add Stock
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default Inventory;
