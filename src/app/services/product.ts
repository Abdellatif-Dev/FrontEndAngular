import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '.';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API = 'http://localhost:8082/api/products';

  constructor(private http: HttpClient) { }


  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API}/${id}`);
  }

  getByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API}/category/${category}`);
  }

  search(name: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API}/search?name=${name}`);
  }

  

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API);
  }

  create(formData: FormData): Observable<Product> {
    return this.http.post<Product>(this.API, formData);
  }

  update(id: number, formData: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.API}/${id}`, formData);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }

}
