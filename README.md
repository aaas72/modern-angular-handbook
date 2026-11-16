# Modern Angular Handbook

A practical reference for modern Angular (v19+): standalone components, Signals, the new control flow, signal-based inputs and outputs, lazy routing, HTTP services, reactive forms and pipes — with a side-by-side comparison to React. The repository is also a runnable Angular 21 app with server-side rendering, so every concept can be explored in real code.

![Angular](https://img.shields.io/badge/Angular_21-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Signals](https://img.shields.io/badge/Signals_&_Standalone-7928CA?style=flat-square)
![SSR](https://img.shields.io/badge/SSR-Hydration-555555?style=flat-square)

> Sections that show code from `src/` describe the running app; sections on interceptors and reactive forms are reference patterns to copy into your own projects.

---

## 📑 Table of Contents

1. [Architecture & Philosophy](#1-architecture--philosophy)
2. [Root Layout & Lazy-Loaded Routing](#2-root-layout--lazy-loaded-routing)
3. [Data Binding Essentials](#3-data-binding-essentials)
4. [Modern Control Flow (`@if`, `@for`, `@switch`)](#4-modern-control-flow-if-for-switch)
5. [State Management with Angular Signals ⚡](#5-state-management-with-angular-signals-)
6. [Component Communication (Signal-based `input()` & `output()`)](#6-component-communication-signal-based-input--output)
7. [Enterprise HTTP Client & Services](#7-enterprise-http-client--services)
8. [Reactive Forms & Validation](#8-reactive-forms--validation)
9. [Formatting with Angular Pipes 🎨](#9-formatting-with-angular-pipes-)
10. [Comprehensive Comparison: Angular 🆚 React](#10-comprehensive-comparison-angular--react)
11. [Getting Started Locally](#11-getting-started-locally)

---

## 1. Architecture & Philosophy

Modern Angular (v17 - v19+) is built upon two revolutionary pillars:
* **Standalone Components:** Elimination of legacy `NgModule` boilerplate in favor of modular, self-contained, and tree-shakeable components.
* **Fine-grained Reactivity (Signals):** Eliminates unnecessary full component re-renders by tracking and updating only the exact DOM nodes that depend on changed state.

---

## 2. Root Layout & Lazy-Loaded Routing

### Master Shell (`src/app/app.html`)
The root application component serves as the layout wrapper (Header, Navigation, and Footer), while dynamic pages are injected into `<router-outlet></router-outlet>`.

```html
<div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased">
  <!-- Shared Sticky Navbar -->
  <app-navbar></app-navbar>

  <!-- Route Placeholder -->
  <main class="flex-1 max-w-6xl mx-auto w-full p-6">
    <router-outlet></router-outlet>
  </main>
</div>
```

### Lazy-Loaded Routes (`src/app/app.routes.ts`)
Routes are split automatically into individual chunks (Code Splitting) and loaded on demand:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then(m => m.Home) // ⚡ Lazy Loaded
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about').then(m => m.About) // ⚡ Lazy Loaded
  }
];
```

---

## 3. Data Binding Essentials

Angular provides four distinct and predictable data binding directions:

```text
       ┌─────────────────────────────────────────────────────────┐
       │                 TypeScript (Component)                  │
       └─────────────────────────────────────────────────────────┘
              ▲                    │                    ▲
              │ (Event)            │ [Property] / {{ }} │ [(Two-way)]
              │                    ▼                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │                     HTML (Template)                     │
       └─────────────────────────────────────────────────────────┘
```

| Type | Syntax | Direction | Practical Example |
| :--- | :---: | :---: | :--- |
| **Interpolation** | `{{ value }}` | TS ➔ HTML | `<h1>Welcome, {{ username }}</h1>` |
| **Property Binding** | `[property]` | TS ➔ HTML | `<button [disabled]="isSubmitting">Submit</button>` |
| **Event Binding** | `(event)` | HTML ➔ TS | `<button (click)="onSave()">Save</button>` |
| **Two-Way Binding** | `[(ngModel)]` | TS ⇄ HTML | `<input [(ngModel)]="searchQuery">` |

---

## 4. Modern Control Flow (`@if`, `@for`, `@switch`)

Replaces legacy structural directives (`*ngIf`, `*ngFor`) with native, high-performance syntax:

### Smart Iteration (`@for` with `track`):
```html
@for (product of products(); track product.id) {
  <div class="card">
    <h3>{{ product.title }}</h3>
  </div>
} @empty {
  <p class="text-slate-400">No products available at the moment.</p>
}
```

### Multi-state Conditions (`@if` & `@else`):
```html
@if (isLoading()) {
  <div class="animate-pulse">Loading data...</div>
} @else if (errorMessage()) {
  <div class="alert-error">{{ errorMessage() }}</div>
} @else {
  <app-product-grid [items]="products()" />
}
```

---

## 5. State Management with Angular Signals ⚡

Signals are the modern standard for reactive state in Angular (equivalent to `useState` and `useMemo` in React):

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({ ... })
export class CartComponent {
  // 1. Primitive Signal
  quantity = signal<number>(1);
  unitPrice = signal<number>(150);

  // 2. Computed Signal (Auto-tracked, memoized, fine-grained)
  totalPrice = computed(() => this.quantity() * this.unitPrice());

  // 3. Modifying state
  increment() {
    this.quantity.update(q => q + 1);
  }

  reset() {
    this.quantity.set(1);
  }
}
```

In Template:
```html
<p>Quantity: {{ quantity() }}</p>
<p>Total: {{ totalPrice() }} $</p>
<button (click)="increment()">+ Increase</button>
```

---

## 6. Component Communication (Signal-based `input()` & `output()`)

Clean and type-safe separation between incoming data and outgoing events:

### Child Component (`card.ts`):
```typescript
import { Component, input, output } from '@angular/core';

@Component({ selector: 'app-card', ... })
export class CardComponent {
  // Inputs (Data In)
  title = input<string>('Default Title');
  price = input.required<number>();

  // Outputs (Events Out)
  actionClick = output<string>();

  onButtonClick() {
    this.actionClick.emit(this.title());
  }
}
```

### Parent Component (`home.html`):
```html
<app-card 
  [title]="course.title" 
  [price]="course.price" 
  (actionClick)="handleCardClick($event)">
</app-card>
```

---

## 7. Enterprise HTTP Client & Services

### Centralized Service (`src/app/core/services/products.service.ts`):
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, catchError, throwError } from 'rxjs';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://fakestoreapi.com/products?limit=6';

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      retry({ count: 2, delay: 1000 }), // Network resilience
      catchError(err => {
        console.error('HTTP Error:', err);
        return throwError(() => new Error('Failed to fetch products'));
      })
    );
  }
}
```

### HTTP Interceptors (Global Auth & Error Handling):
```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
```

---

## 8. Reactive Forms & Validation

Built-in type-safe forms with reactive validators (`required`, `minLength`, `email`):

```typescript
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html'
})
export class ProductFormComponent {
  productForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    category: new FormControl('electronics', [Validators.required])
  });

  onSubmit() {
    if (this.productForm.valid) {
      console.log('Submitted Payload:', this.productForm.value);
    }
  }
}
```

In Template:
```html
<form [formGroup]="productForm" (ngSubmit)="onSubmit()">
  <input type="text" formControlName="title" placeholder="Product Title" />
  
  @if (productForm.get('title')?.touched && productForm.get('title')?.hasError('required')) {
    <p class="text-red-400 text-xs">Title is required.</p>
  }

  <button type="submit" [disabled]="productForm.invalid">Add Product</button>
</form>
```

---

## 9. Formatting with Angular Pipes 🎨

Declarative data transformations directly within template expressions:

```html
<!-- Format Currency -->
<span>{{ product.price | currency:'USD' }}</span>  <!-- Output: $109.95 -->

<!-- Uppercase String -->
<span>{{ product.category | uppercase }}</span>   <!-- Output: ELECTRONICS -->

<!-- Format Dates -->
<span>{{ today | date:'fullDate' }}</span>         <!-- Output: Wednesday, August 19, 2026 -->

<!-- JSON Inspection for Debugging -->
<pre>{{ userState | json }}</pre>
```

---

## 10. Comprehensive Comparison: Angular 🆚 React

| Architectural Concept | Modern Angular 🅰️ | React ⚛️ |
| :--- | :--- | :--- |
| **Framework Scope** | Full-fledged Framework (Batteries-Included) | View Library |
| **Local State** | `signal(0)` | `useState(0)` |
| **Derived / Computed State** | `computed(() => ...)` *(Auto-tracked)* | `useMemo(() => ..., [deps])` |
| **Side Effects** | `effect(() => ...)` *(Auto-tracked)* | `useEffect(() => ..., [deps])` |
| **Component Props** | `title = input()` | `props.title` |
| **Component Events** | `action = output()` | `props.onAction()` callback |
| **Routing** | Native `@angular/router` | External `react-router-dom` |
| **HTTP & API** | Native `HttpClient` + RxJS | External `Axios` / `TanStack Query` |
| **Forms & Validation** | Native `Reactive Forms` | External `React Hook Form` + `Zod` |
| **Re-rendering Model** | Fine-grained DOM node updates | Full component function re-execution |

---

## 11. Getting Started Locally

### Prerequisites:
* Node.js 20.19+ (required by Angular 21)
* Angular CLI 21 (optional — `npm run start` uses the local CLI)

```bash
# 1. Clone repository
git clone https://github.com/aaas72/modern-angular-handbook.git
cd modern-angular-handbook

# 2. Install dependencies
npm install

# 3. Start local development server
npm run start
# or
ng serve

# 4. Production build
ng build
```

Navigate to `http://localhost:4200/` in your browser.

---

## Author

**Abdellah Sheikh** — [abdellahsheikh.dev](https://abdellahsheikh.dev) · [LinkedIn](https://www.linkedin.com/in/abdellahsheikh)
