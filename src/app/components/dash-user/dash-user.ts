import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';
import { OrderResponse, Product } from '../../services';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dash-user',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dash-user.html',
})
export class DashUser implements OnInit {
  private orderSvc = inject(OrderService);
  private productSvc = inject(ProductService);
  public auth = inject(AuthService);

  myOrders = signal<OrderResponse[]>([]);
  allProducts = signal<Product[]>([]);
  loading = signal(true);
  selectedOrder = signal<OrderResponse | null>(null);
  showOrderModal = signal(false);

  totalOrdersCount = computed(() => this.myOrders().length);
  totalSpent = computed(() => this.myOrders().reduce((sum, o) => sum + o.totalAmount, 0));

  recentOrders = computed(() =>
    [...this.myOrders()].sort((a, b) => b.id - a.id).slice(0, 10)
  );

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.orderSvc.getMyOrders().subscribe({
      next: (orders) => {
        this.myOrders.set(orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.productSvc.getAll().subscribe(prods => this.allProducts.set(prods));
  }

  getProductImage(productId: number): string | null {
    const product = this.allProducts().find(p => p.id === productId);
    return product?.imageUrl ?? null;
  }

  viewOrder(order: OrderResponse) {
    this.selectedOrder.set(order);
    this.showOrderModal.set(true);
  }

  closeModal() {
    this.showOrderModal.set(false);
    setTimeout(() => this.selectedOrder.set(null), 300);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'DELIVERED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'SHIPPED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'PROCESSING': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'CONFIRMED': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  }
}