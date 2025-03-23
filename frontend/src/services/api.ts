import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  description: string;
  coverImage: string;
}

export interface OrderItem {
  bookId: number;
  quantity: number;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  total: number;
  status: string;
}

export interface CreateOrderRequest {
  userId: number;
  items: OrderItem[];
}

const api = {
  // Books
  getBooks: () => axios.get<Book[]>(`${API_URL}/books`),
  getBook: (id: number) => axios.get<Book>(`${API_URL}/books/${id}`),
  
  // Orders
  createOrder: (order: CreateOrderRequest) => axios.post<Order>(`${API_URL}/orders`, order),
  getUserOrders: (userId: number) => axios.get<Order[]>(`${API_URL}/orders/${userId}`),
  
  // Stripe
  createPaymentIntent: (orderId: number) => 
    axios.post<{ clientSecret: string }>(`${API_URL}/stripe/create-payment-intent`, { orderId }),
};

export default api; 