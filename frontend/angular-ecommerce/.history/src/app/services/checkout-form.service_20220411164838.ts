import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutFormService {

  constructor() { }

  getCreditCardMonths(startMonth: number): Observable<number> {
    
    let data: number[] = [];

    // an array of month
    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
    return of(data);
  }
}
