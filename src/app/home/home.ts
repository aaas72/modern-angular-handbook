import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, UpperCasePipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductsService, Product } from '../core/services/products.service';
import { Card } from '../shared/components/card/card';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, UpperCasePipe, DatePipe, Card],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private productsService = inject(ProductsService);

  // -------------------------------------------------------------
  // 1. Angular Signals State (Primitives & Computed)
  // -------------------------------------------------------------
  counter = signal<number>(0);
  unitPrice = signal<number>(150);
  quantity = signal<number>(1);

  // Computed Signal: automatically recalculates whenever dependencies change
  totalPrice = computed(() => this.unitPrice() * this.quantity());

  // -------------------------------------------------------------
  // 2. Component Communication (Inputs & Outputs)
  // -------------------------------------------------------------
  learningTracks = signal([
    { id: 1, title: 'Angular 19 Fundamentals', desc: 'Master standalone components, routing, and modern control flow.', tag: 'Beginner' },
    { id: 2, title: 'Signals & State Mastery', desc: 'Deep dive into signals, computed primitives, and fine-grained reactivity.', tag: 'Intermediate' },
    { id: 3, title: 'Enterprise Full-Stack Angular', desc: 'Architecture, HTTP interceptors, RxJS streams, and authentication.', tag: 'Advanced' },
  ]);
  selectedTrack = signal<string | null>(null);

  // -------------------------------------------------------------
  // 3. HTTP Client & API Data
  // -------------------------------------------------------------
  products = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  today = new Date(); // Used for DatePipe demonstration

  // -------------------------------------------------------------
  // 4. Reactive Forms & Real-time Validation
  // -------------------------------------------------------------
  newProductForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    category: new FormControl('electronics', [Validators.required]),
  });

  ngOnInit() {
    this.fetchProducts();
  }

  // --- Actions ---
  increment() { this.counter.update(val => val + 1); }
  decrement() { if (this.counter() > 0) this.counter.update(val => val - 1); }
  resetCounter() { this.counter.set(0); }

  increaseQuantity() { this.quantity.update(q => q + 1); }
  decreaseQuantity() { if (this.quantity() > 1) this.quantity.update(q => q - 1); }

  handleTrackSelect(trackTitle: string) {
    this.selectedTrack.set(trackTitle);
  }

  fetchProducts() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.productsService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to fetch data from the remote server.');
        this.isLoading.set(false);
      }
    });
  }

  onFormSubmit() {
    if (this.newProductForm.invalid) {
      this.newProductForm.markAllAsTouched();
      return;
    }

    const formValues = this.newProductForm.value;
    const newProduct: Product = {
      id: Date.now(),
      title: formValues.title!,
      price: Number(formValues.price!),
      category: formValues.category!,
      description: 'Newly submitted product created via Reactive Forms and Signals.',
      image: 'https://placehold.co/400x400/indigo/white?text=New+Item',
    };

    // Prepend new product directly to Signal array
    this.products.update(list => [newProduct, ...list]);

    // Reset form to default state
    this.newProductForm.reset({ category: 'electronics' });
  }
}
