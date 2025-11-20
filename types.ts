interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    stock: number;
}

type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

interface ApiResponse<T> {
    data: T;
    status: number;
    message: string;
    timestamp: Date;
    success: boolean;
    errors?: string[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
    };
    meta?: {
        total: number;
        page: number;
        limit: number;
    };
}