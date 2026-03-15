import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { Product } from '../../services';
import { ProductService } from '../../services/product';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { AuthDialogComponent } from '../../components/dialog/auth-dialog';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, RouterModule, RouterLink, MatDialogModule, MatSnackBarModule],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  private productSvc = inject(ProductService);
  private authSvc = inject(AuthService);
  public cartSvc = inject(CartService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal(false);

  searchQuery = signal('');
  activeCategory = signal('');

  categories = computed(() => {
    const allCategories = this.products().map(p => p.category).filter(Boolean);
    return [...new Set(allCategories)];
  });

 filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const category = this.activeCategory();
    let list = this.products();

    if (category) {
      list = list.filter(p => p.category === category);
    }

    if (query) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(false);
    this.productSvc.getAll().subscribe({
      next: (p) => {
        this.products.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  filterByCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.activeCategory.set('');
  }

  handleAddToCart(product: Product): void {
    if (!this.authSvc.isLoggedIn()) {
      this.dialog.open(AuthDialogComponent, { 
        width: '400px', 
        panelClass: 'auth-dialog-panel' 
      });
      return;
    }
    
    this.cartSvc.addItem(product);
    this.snackBar.open(`"${product.name}" ajouté au panier`, '✓', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}