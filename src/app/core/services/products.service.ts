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

@Injectable({
  providedIn: 'root', // Singleton service available across the entire application
})
export class ProductsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://fakestoreapi.com/products?limit=6';

  /**
   * Fetches product list from the REST API with automatic retry and error handling.
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      retry({ count: 2, delay: 1000 }), // Automatically retry up to 2 times on network issues
      catchError((error) => {
        console.error('ProductsService HTTP Error:', error);
        return throwError(() => new Error('Failed to load products from server.'));
      })
    );
  }
}
