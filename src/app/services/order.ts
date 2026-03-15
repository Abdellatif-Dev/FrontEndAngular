import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderRequest, OrderResponse } from '.';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API = 'http://localhost:8083/api/orders';

  constructor(private http: HttpClient) { }

  createOrder(req: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.API, req);
  }
  getAllOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(this.API); // GET /api/orders
  }
  getMyOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.API}/my`);
  }

  getOrderById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.API}/${id}`);
  }

  downloadInvoice(orderId: number): Observable<Blob> {
    return this.http.get(`${this.API}/${orderId}/invoice`, { responseType: 'blob' });
  }
}
