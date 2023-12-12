
import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { THIRDPARTIES } from '../../thirdparty/models/thirdparties.mock-data';
import { Thirdparty } from '../../thirdparty/models/thirdparty.model';

@Injectable({ providedIn: 'root' })
export class TypeaheadService {
    
	search(term: string, typeSearch: string): Observable<any[]> {
        console.log('TypeaheadService.search()', typeSearch, term);
        return of(THIRDPARTIES.filter(v => v.fiscalName.toLowerCase().includes(term.toLowerCase())))
      .pipe(
        // map((response: Thirdparty[]) => response.map((tp: Thirdparty) => tp.fiscalName)),
        delay(600)
        );
  }
}