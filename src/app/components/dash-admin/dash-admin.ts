import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order';
import { ProductService } from '../../services/product';
import { Product, OrderResponse } from '../../services';
import { RouterLink } from "@angular/router";

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType, Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dash-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './dash-admin.html',
})
export class DashAdmin implements OnInit {
  private orderSvc = inject(OrderService);
  private productSvc = inject(ProductService);
  selectedOrder = signal<OrderResponse | null>(null);
  showOrderModal = signal(false);
  allOrders = signal<OrderResponse[]>([]);
  allProducts = signal<Product[]>([]);
  loading = signal(true);

  chartFilter = signal<'days' | 'months'>('days');

  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Revenus (DH)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: '#f59e0b',
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#f59e0b',
        fill: 'origin',
        tension: 0.4,
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f59e0b',
        bodyColor: '#fff',
        padding: 12,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.productSvc.getAll().subscribe(products => this.allProducts.set(products));
    this.orderSvc.getAllOrders().subscribe({
      next: (orders) => {
        this.allOrders.set(orders);
        this.updateChart();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setFilter(filter: 'days' | 'months') {
    this.chartFilter.set(filter);
    this.updateChart();
  }

  updateChart() {
    const orders = this.allOrders();
    let labels: string[] = [];
    let revenueData: number[] = [];

    if (this.chartFilter() === 'days') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const dayRevenue = orders
          .filter(o => new Date(o.createdAt).toISOString().split('T')[0] === dateStr)
          .reduce((sum, o) => sum + o.totalAmount, 0);

        labels.push(d.toLocaleDateString('fr-FR', { weekday: 'short' }));
        revenueData.push(dayRevenue);
      }
    } else {
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      labels = months;
      const currentYear = new Date().getFullYear();

      revenueData = months.map((_, index) => {
        return orders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getFullYear() === currentYear && orderDate.getMonth() === index;
          })
          .reduce((sum, o) => sum + o.totalAmount, 0);
      });
    }

    this.lineChartData = {
      labels: labels,
      datasets: [{ ...this.lineChartData.datasets[0], data: revenueData }]
    };
  }

  totalRevenue = computed(() => this.allOrders().reduce((acc, order) => acc + order.totalAmount, 0));
  productCount = computed(() => this.allProducts().length);
  orderCount = computed(() => this.allOrders().length);
  lowStockProducts = computed(() => this.allProducts().filter(p => p.stock < 10));
  recentOrders = computed(() => [...this.allOrders()].sort((a, b) => b.id - a.id).slice(0, 8));

  getStatusClass(status: string) {
    switch (status) {
      case 'DELIVERED': return 'bg-emerald-500/10 text-emerald-500';
      case 'CONFIRMED': return 'bg-blue-500/10 text-blue-500';
      case 'PENDING': return 'bg-amber-500/10 text-amber-500';
      case 'CANCELLED': return 'bg-red-500/10 text-red-500';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  }

  viewOrder(order: OrderResponse) {
    this.selectedOrder.set(order);
    this.showOrderModal.set(true);
  }

  closeModal() {
    this.showOrderModal.set(false);
    setTimeout(() => this.selectedOrder.set(null), 300);
  }
  getProductImage(productId: number): string | null {
    const product = this.allProducts().find(p => p.id === productId);
    return product?.imageUrl ?? null;
  }

}