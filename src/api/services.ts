import client from './client';

export interface User {
    id: number;
    username: string;
    role: string;
    full_name?: string;
    email?: string;
    address?: string;
}

export interface Item {
    id: number;
    name: string;
    price: number;
    margin: number;
    quantity: number;
    reorder_level: number;
    category_id: number;
    category?: {
        id: number;
        name: string;
    };
}

export interface Category {
    id: number;
    name: string;
}

export interface Transaction {
    id: number;
    item_id: number;
    user_id: number;
    type: 'purchase' | 'sale';
    quantity: number;
    price: number;
    supplier?: string;
    timestamp: string;
    item?: Item;
}

export const getItems = async () => {
    const response = await client.get<Item[]>('/items/');
    return response.data;
};

export const createItem = async (data: Omit<Item, 'id' | 'category'>) => {
    const response = await client.post<Item>('/items/', data);
    return response.data;
};

export const updateItem = async (id: number, data: Omit<Item, 'id' | 'category'>) => {
    const response = await client.put<Item>(`/items/${id}`, data);
    return response.data;
};

export const deleteItem = async (id: number) => {
    const response = await client.delete<Item>(`/items/${id}`);
    return response.data;
};

export const getCategories = async () => {
    const response = await client.get<Category[]>('/items/categories/');
    return response.data;
};

export const createCategory = async (name: string) => {
    const response = await client.post<Category>('/items/categories', { name });
    return response.data;
};

export const updateCategory = async (id: number, name: string) => {
    const response = await client.put<Category>(`/items/categories/${id}`, { name });
    return response.data;
};

export const deleteCategory = async (id: number) => {
    const response = await client.delete<Category>(`/items/categories/${id}`);
    return response.data;
};

export const createTransaction = async (data: {
    item_id: number;
    quantity: number;
    type: 'purchase' | 'sale';
    supplier?: string;
}) => {
    const response = await client.post<Transaction>('/transactions/', data);
    return response.data;
};

export const getTransactions = async () => {
    const response = await client.get<Transaction[]>('/transactions/');
    return response.data;
};

// Helper to get transactions is missing in backend?
// I need to check if there is an endpoint to get transactions.
// Looking at previous file views, I didn't see a GET /transactions endpoint in routers/transactions.py.
// I might need to add it to the backend to support the Dashboard sales chart.

export interface OrderItem {
    id: number;
    item_id: number;
    quantity: number;
    price: number;
    order_id: number;
}

export interface Order {
    id: number;
    customer_id: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    order_date: string;
    delivery_date?: string;
    total_amount: number;
    delivery_address: string;
    order_items: OrderItem[];
}

export const createOrder = async (data: {
    customer_id: number;
    delivery_address: string;
    order_items: {
        item_id: number;
        quantity: number;
        price: number;
    }[];
}) => {
    const response = await client.post<Order>('/orders/', data);
    return response.data;
};

export const getOrders = async () => {
    const response = await client.get<Order[]>('/orders/');
    return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string) => {
    const response = await client.put(`/orders/${orderId}/status`, { status });
    return response.data;
};

export const getMe = async () => {
    const response = await client.get<User>('/auth/me');
    return response.data;
};

export const updateUser = async (userData: Partial<User>) => {
    const response = await client.put<User>('/auth/me', userData);
    return response.data;
};
