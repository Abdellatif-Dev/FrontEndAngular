import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';
import { CreateOrderRequest } from '../../services';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html'
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  cartSvc = inject(CartService);
  private orderSvc = inject(OrderService);
  lastOrderId = signal<number | null>(null);

  loading = signal(false);
  orderSuccess = signal(false);

  checkoutForm: FormGroup = this.fb.group({
    shippingAddress: ['', [Validators.required, Validators.minLength(10)]],
    notes: ['']
  });

  onSubmit() {
    if (this.checkoutForm.invalid || this.cartSvc.isEmpty()) return;

    this.loading.set(true);

    const orderRequest: CreateOrderRequest = {
      items: this.cartSvc.items().map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      shippingAddress: this.checkoutForm.value.shippingAddress,
      notes: this.checkoutForm.value.notes
    };

    console.log("Payload verified:", orderRequest);

    this.orderSvc.createOrder(orderRequest).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.lastOrderId.set(res.id);
        this.orderSuccess.set(true);
        this.cartSvc.clear();
      },
      error: (err) => {
        this.loading.set(false);
        console.error("Server Error Detail:", err.error);
        alert("Erreur lors de la création de la commande.");
      }
    });
  }
  downloadInvoice() {
    const id = this.lastOrderId();
    if (!id) return;

    this.orderSvc.downloadInvoice(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture-commande-${id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },

    });
  }
}