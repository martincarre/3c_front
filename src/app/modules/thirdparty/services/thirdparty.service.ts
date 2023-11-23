import { Injectable } from '@angular/core';
import { Thirdparty } from '../models/thirdparty.model';
import { THIRDPARTIES } from '../models/thirdparties.mock-data';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ThirdpartyService {
  
  private thirdparties: BehaviorSubject<Thirdparty[]> = new BehaviorSubject<Thirdparty[]>([]);

  constructor(
    private http: HttpClient
  ) {
    this.fetchThirdparties();
  }
  
  addThirdparty(thirdparty: Thirdparty): Observable<Thirdparty>{
    this.thirdparties.next([...this.thirdparties.getValue(), thirdparty])
    return of(thirdparty);
  }

  getThirdparties(): Observable<Thirdparty[]>{
    return this.thirdparties.asObservable();
  }

  private fetchThirdparties(): void {
    of(THIRDPARTIES).pipe(delay(500)).subscribe(thirdparties => {
      this.thirdparties.next(thirdparties);
    });
  }
}
