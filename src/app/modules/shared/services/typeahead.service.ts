
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, Subscription } from 'rxjs';
import { Thirdparty } from '../../thirdparty/models/thirdparty.model';
import { ThirdpartyService } from '../../thirdparty/services/thirdparty.service';

@Injectable({ providedIn: 'root' })
export class TypeaheadService {

  private tpSub: Subscription = new Subscription();
  private thirdparties: BehaviorSubject<Thirdparty[]> = new BehaviorSubject<Thirdparty[]>([]);

  constructor(
    private thirdpartyService: ThirdpartyService
  ) {
    this.fetchData();
  }
  private fetchData(): void {
    this.tpSub = this.thirdpartyService.fetchThirdparties('partner')
      .subscribe((data: Thirdparty[]) => {
        this.thirdparties.next(data);
      });
  }

	search(term: string, typeSearch: string): Observable<Thirdparty[]> {
    this.fetchData();
    return this.thirdparties.asObservable()
      .pipe(
        map((tps: Thirdparty[]) => {
           return tps.filter(v => v.fiscalName.toLowerCase().includes(term.toLowerCase()));
        })
      )
  }

  getThirdparties(): Observable<Thirdparty[]> {
    return this.thirdparties.asObservable();
  }

}