import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private visibility = new BehaviorSubject<boolean>(false);
  visibility$ = this.visibility.asObservable();

  show() {
    this.visibility.next(true);
  }

  hide() {
    this.visibility.next(false);
  }
}