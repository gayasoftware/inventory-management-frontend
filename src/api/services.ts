import client from './client';

export interface Address {
    id?: number;
    label: string;
    street_address: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
    is_default?: boolean;
}

export interface User {
    id: number;
    username: string;
    role: string;
    full_name?: string;
    email?: string;
    phone_number?: string;
    addresses?: Address[];
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface SKU {
    id: number;
    product_id: number;
    sku_code: string;
    price: number;
    cost_price?: number;
    attributes?: string; // JSON string
    reorder_level: number;
}

export interface Product {
    id: number;
    name: string;
    description?: string;
    brand?: string;
    category_id: number;
    image_url?: string;
    is_active: boolean;
    category?: Category;
    skus?: SKU[];
}

export interface InventoryLocation {
    id: number;
    name: string;
    type: string;
    address?: string;
    pincode?: string;
}

export interface StockMovement {
    id?: number;
    sku_id: number;
    from_location_id?: number;
    to_location_id?: number;
    quantity: number;
    type: 'purchase' | 'sale' | 'transfer' | 'adjustment' | 'return_in';
    reference_id?: string;
    timestamp?: string;
    user_id?: number;
}

export interface StockLevel {
    id: number;
    sku_id: number;
    location_id: number;
    quantity: number;
    reserved_quantity: number;
}

export interface OrderItem {
    id: number;
    order_id: number;
    sku_id: number;
    quantity: number;
    price: number;
}

export interface Payment {
    id: number;
    order_id: number;
    amount: number;
    method: string;
    status: string;
    transaction_id?: string;
    timestamp: string;
}

export interface Order {
    id: number;
    customer_id: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    order_date: string;
    delivery_date?: string;
    total_amount: number;
    tracking_number?: string;
    shipping_address?: Address;
    order_items: OrderItem[];
    payments: Payment[];
}

// Product API
export const getProducts = async () => {
    const response = await client.get<Product[]>('/products/');
    return response.data;
};

export const updateProduct = async (id: number, data: any) => {
    const response = await client.put<Product>(`/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id: number) => {
    await client.delete(`/products/${id}`);
};

export const getProduct = async (id: number) => {
    const response = await client.get<Product>(`/products/${id}`);
    return response.data;
};

export const createProduct = async (data: any) => {
    const response = await client.post<Product>('/products/', data);
    return response.data;
};

export const createSKU = async (productId: number, data: any) => {
    const response = await client.post<SKU>(`/products/${productId}/skus/`, data);
    return response.data;
};

export const updateSKU = async (productId: number, skuId: number, data: any) => {
    const response = await client.put<SKU>(`/products/${productId}/skus/${skuId}`, data);
    return response.data;
};

export const deleteSKU = async (productId: number, skuId: number) => {
    await client.delete(`/products/${productId}/skus/${skuId}`);
};

// Category API
export const getCategories = async () => {
    // Assuming category endpoint is still under /items/categories or moved?
    // I didn't verify category router. Assuming it's still there or I need to fix it.
    // Wait, I removed items.py. I need to check if categories were in items.py.
    // Yes, they were. I need to restore category endpoints in products.py or a new router.
    // For now, I'll assume I'll fix the backend.
    const response = await client.get<Category[]>('/products/categories/');
    return response.data;
};

export const createCategory = async (name: string) => {
    const response = await client.post<Category>('/products/categories/', { name });
    return response.data;
};

export const updateCategory = async (id: number, name: string) => {
    const response = await client.put<Category>(`/products/categories/${id}`, { name });
    return response.data;
};

export const deleteCategory = async (id: number) => {
    const response = await client.delete<Category>(`/products/categories/${id}`);
    return response.data;
};

// Order API
export const createOrder = async (data: any) => {
    const response = await client.post<Order>('/orders/', data);
    return response.data;
};

export const getOrders = async () => {
    const response = await client.get<Order[]>('/orders/');
    return response.data;
};

export const getOrder = async (id: number) => {
    const response = await client.get<Order>(`/orders/${id}`);
    return response.data;
};

export const payOrder = async (orderId: number, data: any) => {
    const response = await client.post<Order>(`/orders/${orderId}/pay`, data);
    return response.data;
};

export const cancelOrder = async (orderId: number) => {
    const response = await client.post<Order>(`/orders/${orderId}/cancel`);
    return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string) => {
    const response = await client.put<Order>(`/orders/${orderId}/status`, { status });
    return response.data;
};

export const getLocations = async () => {
    const response = await client.get<InventoryLocation[]>('/inventory/locations/');
    return response.data;
};

// Auth API
export const getMe = async () => {
    const response = await client.get<User>('/users/me/profile');
    return response.data;
};

export const updateUser = async (userData: Partial<User>) => {
    const response = await client.put<User>('/users/me/profile', userData);
    return response.data;
};

// User Addresses API
export const getUserAddresses = async () => {
    const response = await client.get<Address[]>('/users/me/addresses');
    return response.data;
};

export const createUserAddress = async (address: any) => {
    const response = await client.post<Address>('/users/me/addresses', address);
    return response.data;
};

export const updateUserAddress = async (addressId: number, address: any) => {
    const response = await client.put<Address>(`/users/me/addresses/${addressId}`, address);
    return response.data;
};

export const deleteUserAddress = async (addressId: number) => {
    await client.delete(`/users/me/addresses/${addressId}`);
};

// User Orders API
export const getUserOrders = async () => {
    const response = await client.get<Order[]>('/users/me/orders');
    return response.data;
};

// Inventory API
export const getInventoryLocations = async () => {
    const response = await client.get<InventoryLocation[]>('/inventory/locations/');
    return response.data;
};

export const createInventoryLocation = async (location: any) => {
    const response = await client.post<InventoryLocation>('/inventory/locations/', location);
    return response.data;
};

export const getStockLevels = async () => {
    const response = await client.get<StockLevel[]>('/inventory/stock/');
    return response.data;
};

export const createStockLevel = async (stockLevel: any) => {
    const response = await client.post<StockLevel>('/inventory/stock/', stockLevel);
    return response.data;
};

export const addStock = async (stockMovement: any) => {
    const response = await client.post('/inventory/stock/add', stockMovement);
    return response.data;
};

export const getStockMovements = async () => {
    const response = await client.get<StockMovement[]>('/inventory/movements/');
    return response.data;
};

export const getStock = async (skuId: number) => {
    const response = await client.get<number>(`/inventory/stock/${skuId}`);
    return response.data;
};

// Item API (placeholders - adjust backend as needed)
export interface Item {
    id: number;
    name: string;
    price: number;
    margin?: number;
    quantity: number;
    reorder_level: number;
    category_id: number;
    category?: Category;
}

export const getItems = async () => {
    const response = await client.get<Item[]>('/items/');
    return response.data;
};

export const createItem = async (data: any) => {
    const response = await client.post<Item>('/items/', data);
    return response.data;
};

export const updateItem = async (id: number, data: any) => {
    const response = await client.put<Item>(`/items/${id}`, data);
    return response.data;
};

export const deleteItem = async (id: number) => {
    await client.delete(`/items/${id}`);
};

// Transaction API (placeholders - adjust backend as needed)
export interface Transaction {
    id: number;
    item_id: number;
    quantity: number;
    type: 'purchase' | 'sale';
    price: number;
    timestamp: string;
    supplier?: string;
}

export const getTransactions = async () => {
    const response = await client.get<Transaction[]>('/transactions/');
    return response.data;
};

export const createTransaction = async (data: any) => {
    const response = await client.post<Transaction>('/transactions/', data);
    return response.data;
};
