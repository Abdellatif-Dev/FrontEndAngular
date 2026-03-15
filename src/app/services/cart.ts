import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '.';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  readonly items      = this._items.asReadonly();
  readonly count      = computed(() => this._items().reduce((s, i) => s + i.quantity, 0));
  readonly total      = computed(() => this._items().reduce((s, i) => s + i.product.price * i.quantity, 0));
  readonly isEmpty    = computed(() => this._items().length === 0);
  readonly isOpen     = signal(false);

  addItem(product: Product, quantity = 1): void {
    this._items.update(items => {
      const idx = items.findIndex(i => i.product.id === product.id);
      if (idx >= 0) {
        const updated = [...items];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [...items, { product, quantity }];
    });
    this.isOpen.set(true);
  }

  removeItem(productId: number): void {
    this._items.update(items => items.filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) { this.removeItem(productId); return; }
    this._items.update(items =>
      items.map(i => i.product.id === productId ? { ...i, quantity } : i)
    );
  }

  clear(): void {
    this._items.set([]);
    this.isOpen.set(false);
  }

  toggleCart(): void {
    this.isOpen.update(v => !v);
  }

  openCart(): void  { this.isOpen.set(true); }
  closeCart(): void { this.isOpen.set(false); }
}
