import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, X, Filter, Package, Edit, Trash2 } from 'lucide-react';
import { getProducts, updateProduct, deleteProduct, createProduct, getCategories, createSKU, updateSKU, Product, Category } from '../api/services';
import toast from 'react-hot-toast';
import SearchableSelect from '../components/SearchableSelect';

interface ProductFormData {
    name: string;
    description: string;
    brand: string;
    category_id: number;
    image_url: string;
}

interface SKUFormData {
    sku_code: string;
    cost_price: number;
    margin: number;
    price: number;
    reorder_level: number;
    description: string;
    quantity: number;
}

interface SKU {
    id: number;
    product_id: number;
    sku_code: string;
    price: number;
    cost_price?: number;
    attributes?: string;
    reorder_level: number;
    description?: string;
    quantity?: number;
}

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSKUModalOpen, setIsSKUModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingSKU, setEditingSKU] = useState<SKU | null>(null);

    const { register: registerProduct, handleSubmit: handleSubmitProduct, reset: resetProduct, formState: { errors: productErrors } } = useForm<ProductFormData>();
    const { register: registerSKU, handleSubmit: handleSubmitSKU, reset: resetSKU } = useForm<SKUFormData>();

    const fetchData = async () => {
        try {
            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onProductSubmit = async (data: ProductFormData) => {
        try {
            if (!selectedCategoryId) {
                toast.error('Please select a category');
                return;
            }
            const productData = { ...data, category_id: selectedCategoryId };

            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
                toast.success('Product updated successfully');
            } else {
                await createProduct(productData);
                toast.success('Product created successfully');
            }

            setIsProductModalOpen(false);
            setSelectedCategoryId(undefined);
            setEditingProduct(null);
            resetProduct();
            fetchData();
        } catch (error) {
            toast.error('Failed to save product');
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                await deleteProduct(id);
                toast.success('Product deleted successfully');
                fetchData();
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const onSKUSubmit = async (data: SKUFormData) => {
        if (!selectedProduct) return;
        try {
            // Calculate price from cost_price + margin
            const cost_price = data.cost_price;
            const margin = data.margin;
            const calculatedPrice = cost_price * (1 + margin / 100);

            const skuData = {
                ...data,
                price: calculatedPrice
            };

            if (editingSKU) {
                // Update existing SKU
                // Note: API updateSKU function doesn't exist yet, we'll add it
                await updateSKU(selectedProduct.id, editingSKU.id, skuData);
                toast.success('SKU updated successfully');
            } else {
                // Create new SKU
                await createSKU(selectedProduct.id, skuData);
                toast.success('SKU added successfully');
            }

            setIsSKUModalOpen(false);
            setEditingSKU(null);
            resetSKU();
            fetchData();
        } catch (error) {
            toast.error(editingSKU ? 'Failed to update SKU' : 'Failed to add SKU');
        }
    };



    const openSKUModal = (product: Product) => {
        setSelectedProduct(product);
        setEditingSKU(null);
        resetSKU();
        setIsSKUModalOpen(true);
    };

    const openEditSKUModal = (product: Product, sku: SKU) => {
        setSelectedProduct(product);
        setEditingSKU(sku);

        // Calculate margin from cost_price and selling price
        const margin = sku.cost_price ? ((sku.price - sku.cost_price) / sku.cost_price) * 100 : 25;

        // Pre-populate form with existing SKU data
        resetSKU({
            sku_code: sku.sku_code,
            cost_price: sku.cost_price || 0,
            margin: margin,
            price: sku.price,
            reorder_level: sku.reorder_level,
            description: sku.description || '',
            quantity: sku.quantity || 0
        });

        setIsSKUModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setSelectedCategoryId(product.category_id);

        // Pre-populate form with existing product data
        resetProduct({
            name: product.name,
            description: product.description || '',
            brand: product.brand || '',
            category_id: product.category_id,
            image_url: product.image_url || ''
        });

        setIsProductModalOpen(true);
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 mt-1">Manage your product catalog and inventory.</p>
                </div>
                <button
                    onClick={() => setIsProductModalOpen(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Product
                </button>
            </div>

            <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
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
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <SearchableSelect
                        className="w-full"
                        options={[
                            { value: 'all', label: 'All Categories' },
                            ...categories.map(category => ({ value: category.id, label: category.name }))
                        ]}
                        value={selectedCategory}
                        onChange={(value) => setSelectedCategory(value === 'all' ? 'all' : Number(value))}
                        placeholder="Filter by category"
                    />
                </div>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden animate-slide-up">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Product</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Brand</th>
                                <th className="px-6 py-4 font-medium">SKUs</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        <p className="text-lg font-medium text-gray-900">No products found</p>
                                        <p className="text-sm">Try adjusting your search or add a new product.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                                                    {product.name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-gray-500 truncate max-w-xs">{product.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {product.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{product.brand || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {product.skus && product.skus.length > 0 ? (
                                                    product.skus.slice(0, 3).map((sku) => (
                                                        <button
                                                            key={sku.id}
                                                            onClick={() => openEditSKUModal(product, sku)}
                                                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-primary-100 hover:bg-primary-200 flex items-center justify-center text-xs font-medium text-primary-700 transition-colors"
                                                            title={`${sku.sku_code} - Click to edit`}
                                                        >
                                                            {sku.sku_code.slice(0, 2)}
                                                        </button>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 italic">No SKUs</span>
                                                )}
                                                {product.skus && product.skus.length > 3 && (
                                                    <button
                                                        onClick={() => openSKUModal(product)}
                                                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 transition-colors"
                                                        title={`+${product.skus.length - 3} more SKUs - Click to manage`}
                                                    >
                                                        +{product.skus.length - 3}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openSKUModal(product)}
                                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Add SKU"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button onClick={() => {
                                setIsProductModalOpen(false);
                                setEditingProduct(null);
                                setSelectedCategoryId(undefined);
                                resetProduct();
                            }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitProduct(onProductSubmit)} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input {...registerProduct('name', { required: true })} className="input-field" placeholder="e.g. Wireless Headphones" />
                                    {productErrors.name && <span className="text-xs text-red-500 mt-1">Required</span>}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea {...registerProduct('description')} className="input-field min-h-[80px]" placeholder="Product details..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                    <input {...registerProduct('brand')} className="input-field" placeholder="e.g. Sony" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <SearchableSelect
                                        options={categories.map(c => ({ value: c.id, label: c.name }))}
                                        value={selectedCategoryId}
                                        onChange={(value) => setSelectedCategoryId(Number(value))}
                                        placeholder="Select category"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <input {...registerProduct('image_url')} className="input-field" placeholder="https://..." />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => {
                                    setIsProductModalOpen(false);
                                    setEditingProduct(null);
                                    setSelectedCategoryId(undefined);
                                    resetProduct();
                                }} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SKU Modal */}
            {isSKUModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingSKU ? 'Edit SKU' : `Add SKU for ${selectedProduct?.name}`}
                            </h2>
                            <button onClick={() => {
                                setIsSKUModalOpen(false);
                                setEditingSKU(null);
                                resetSKU();
                            }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitSKU(onSKUSubmit)} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU Code</label>
                                    <input {...registerSKU('sku_code', { required: true })} className="input-field" placeholder="e.g. WH-1000XM4-BLK" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">INR</span>
                                        <input type="number" step="0.01" {...registerSKU('cost_price', { required: true })} className="input-field pl-8" placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Margin (%)</label>
                                    <div className="relative">
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                        <input type="number" step="0.01" {...registerSKU('margin', { required: true, min: 0 })} className="input-field pr-8" placeholder="25.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">INR</span>
                                        <input type="number" step="0.01" {...registerSKU('price')} className="input-field pl-8 bg-gray-50" placeholder="0.00" readOnly />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Auto-calculated: Cost + Margin</p>
                                </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                                <input type="number" {...registerSKU('reorder_level', { required: true, min: 0 })} className="input-field" defaultValue={10} />
                            </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input {...registerSKU('description')} className="input-field" placeholder="SKU description..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input type="number" {...registerSKU('quantity', { required: true, min: 0 })} className="input-field" placeholder="100" />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => {
                                    setIsSKUModalOpen(false);
                                    setEditingSKU(null);
                                    resetSKU();
                                }} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">
                                    {editingSKU ? 'Update SKU' : 'Add SKU'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
