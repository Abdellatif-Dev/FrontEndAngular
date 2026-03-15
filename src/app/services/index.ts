// ─── Product ────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Auth ───────────────────────────────────────────────
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'USER';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  message: string;
}

export interface User {
  username: string;
  email: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
}

// ─── Cart ───────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Order ──────────────────────────────────────────────
export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  shippingAddress: string;
  notes?: string;
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  customerUsername: string;
  customerEmail: string;
  items: OrderItemResponse[];
  totalAmount: number;
  status: string;
  shippingAddress: string;
  notes?: string;
  invoicePath?: string;
  createdAt: string;
}

// ─── API ─────────────────────────────────────────────────
export interface ApiError {
  error: string;
  status?: number;
}
