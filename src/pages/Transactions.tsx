import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowDownCircle, ArrowUpCircle, History } from 'lucide-react';
import { getItems, createTransaction, getTransactions, Item, Transaction } from '../api/services';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface TransactionFormData {
    item_id: number;
    quantity: number;
    supplier?: string;
}

const Transactions = () => {
    const [activeTab, setActiveTab] = useState<'purchase' | 'sale'>('sale');
    const [items, setItems] = useState<Item[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TransactionFormData>();
    const selectedItemId = watch('item_id');
    const selectedItem = items.find(i => i.id === Number(selectedItemId));

    const fetchData = async () => {
        try {
            const [itemsData, transactionsData] = await Promise.all([
                getItems(),
                getTransactions()
            ]);
            setItems(itemsData);
            setTransactions(transactionsData.sort((a: Transaction, b: Transaction) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (data: TransactionFormData) => {
        try {
            await createTransaction({
                item_id: Number(data.item_id),
                quantity: Number(data.quantity),
                type: activeTab,
                supplier: activeTab === 'purchase' ? data.supplier : undefined
            });
            toast.success('Transaction recorded successfully');
            reset();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to record transaction');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transaction Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex border-b">
                            <button
                                onClick={() => setActiveTab('sale')}
                                className={clsx(
                                    "flex-1 py-4 text-sm font-medium text-center transition-colors",
                                    activeTab === 'sale' ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                <div className="flex items-center justify-center">
                                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                                    Record Sale
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('purchase')}
                                className={clsx(
                                    "flex-1 py-4 text-sm font-medium text-center transition-colors",
                                    activeTab === 'purchase' ? "bg-green-50 text-green-600 border-b-2 border-green-600" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                <div className="flex items-center justify-center">
                                    <ArrowDownCircle className="w-4 h-4 mr-2" />
                                    Record Purchase
                                </div>
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Item</label>
                                    <select
                                        {...register('item_id', { required: 'Item is required' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    >
                                        <option value="">Select an item...</option>
                                        {items.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} (Stock: {item.quantity})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.item_id && <span className="text-red-500 text-xs">{errors.item_id.message}</span>}
                                </div>

                                {selectedItem && (
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                        <p>Current Price: <span className="font-semibold">INR {selectedItem.price.toFixed(2)}</span></p>
                                        <p>Current Stock: <span className="font-semibold">{selectedItem.quantity}</span></p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        {...register('quantity', { required: 'Quantity is required', min: 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.quantity && <span className="text-red-500 text-xs">{errors.quantity.message}</span>}
                                </div>

                                {activeTab === 'purchase' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                                        <input
                                            {...register('supplier', { required: 'Supplier is required for purchases' })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter supplier name"
                                        />
                                        {errors.supplier && <span className="text-red-500 text-xs">{errors.supplier.message}</span>}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className={clsx(
                                        "w-full py-2 px-4 rounded-lg text-white font-medium transition-colors",
                                        activeTab === 'sale' ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
                                    )}
                                >
                                    {activeTab === 'sale' ? 'Confirm Sale' : 'Confirm Purchase'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <History className="w-5 h-5 mr-2 text-gray-500" />
                                Recent Transactions
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Item</th>
                                        <th className="px-6 py-3">Quantity</th>
                                        <th className="px-6 py-3">Total</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions.map((t) => {
                                            const item = items.find(i => i.id === t.item_id);
                                            return (
                                                <tr key={t.id} className="border-b hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <span className={clsx(
                                                            "px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                                                            t.type === 'sale' ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                                                        )}>
                                                            {t.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">{item?.name || `Item #${t.item_id}`}</td>
                                                    <td className="px-6 py-4">{t.quantity}</td>
                                                    <td className="px-6 py-4">INR {(t.price * t.quantity).toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        {new Date(t.timestamp).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        {t.supplier ? `Supplier: ${t.supplier}` : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
