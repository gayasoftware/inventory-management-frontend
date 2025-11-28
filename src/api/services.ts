import client from './client';

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
