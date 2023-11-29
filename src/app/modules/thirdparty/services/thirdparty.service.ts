import { Injectable } from '@angular/core';
import { Thirdparty } from '../models/thirdparty.model';
import { THIRDPARTIES } from '../models/thirdparties.mock-data';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ThirdpartyService {
  
  private geographicData: any[] = [];
  private thirdparties: BehaviorSubject<Thirdparty[]> = new BehaviorSubject<Thirdparty[]>([]);

  constructor(
    private http: HttpClient
  ) {
    this.fetchThirdparties();
  }
  
  
  public getThirdparties(): Observable<Thirdparty[]>{
    return this.thirdparties.asObservable();
  }
  
  public fetchThirdPartyById(id: string): Observable<Thirdparty>{
    const found = this.thirdparties.value.find(tp => tp.fiscalId === id);
    if (!found) {
      return throwError(() => new Error('Thirdparty not found'));
    }
    return of(found);
  }
  
  public addThirdparty(thirdparty: Thirdparty): Observable<any>{
    this.thirdparties.next([...this.thirdparties.getValue(), thirdparty])
    return of({ message: 'Thirdparty added'});
  }

  public updateThirdparty(thirdparty: Thirdparty): Observable<any>{
    const found = this.thirdparties.value.find(tp => tp.fiscalId === thirdparty.fiscalId);
    if (!found) {
      return throwError(() => new Error('Thirdparty not found'));
    }
    const result = this.thirdparties.getValue().filter(tp => tp.fiscalId !== thirdparty.fiscalId);
    result.push(thirdparty);
    this.thirdparties.next(result);
    return of({ message: 'Thirdparty updated'});
  }

  public deleteThirdparty(fiscalId: string): Promise<any>{
    return new Promise((resolve, reject) => {
      const result: any = this.thirdparties.getValue().filter(tp => tp.fiscalId !== fiscalId)
      console.log(result);
      if (!result || result.error) {
        reject({
          status: 404,
          message: result.error
        });
      }
      this.thirdparties.next(result);
      resolve({
        status: 200,
        message: 'Thirdparty deleted'
      });
    });
  }

  private fetchThirdparties(): void {
    of(THIRDPARTIES).pipe(delay(500)).subscribe(thirdparties => {
      this.thirdparties.next(thirdparties);
    });
  }
}
