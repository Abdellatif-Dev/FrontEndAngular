import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../services/product';
import { Product } from '../../services';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-produit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './produit.html',
})
export class ProduitComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productSvc = inject(ProductService);

  products = signal<Product[]>([]);
  showForm = signal(false);
  isEditing = signal(false);
  currentProductId = signal<number | null>(null);
  imagePreview = signal<string | null>(null);

  loading = signal(false); 
  error = signal(false);   
  
  selectedFile: File | null = null;

  productForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true); 
    this.error.set(false);   
    this.productSvc.getAll()
      .pipe(
        finalize(() => this.loading.set(false)) 
      )
      .subscribe({
        next: (data) => {
          this.products.set(data);
          this.error.set(false);
        },
        error: (err) => {
          console.error('Error fetching products:', err);
          this.error.set(true);
          }
      });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  toggleForm() {
    this.showForm.set(!this.showForm());
    if (!this.showForm()) this.resetForm();
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    const formData = new FormData();
    const productData = JSON.stringify(this.productForm.value);
    formData.append('product', new Blob([productData], { type: 'application/json' }));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.isEditing()) {
      this.productSvc.update(this.currentProductId()!, formData).subscribe(() => {
        this.loadProducts();
        this.toggleForm();
      });
    } else {
      if (!this.selectedFile) {
        alert("Veuillez choisir une image");
        return;
      }
      this.productSvc.create(formData).subscribe(() => {
        this.loadProducts();
        this.toggleForm();
      });
    }
  }

  editProduct(product: Product) {
    this.isEditing.set(true);
    this.currentProductId.set(product.id);
    this.productForm.patchValue(product);
    const baseUrl = 'http://localhost:8082';
    this.imagePreview.set(product.imageUrl ? baseUrl + product.imageUrl : null);
    this.showForm.set(true);
  }

  deleteProduct(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      this.productSvc.delete(id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => alert("Erreur lors de la suppression")
      });
    }
  }

  resetForm() {
    this.productForm.reset({ price: 0, stock: 0 });
    this.imagePreview.set(null);
    this.selectedFile = null;
    this.isEditing.set(false);
    this.currentProductId.set(null);
  }
}