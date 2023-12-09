import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private visibility = new BehaviorSubject<boolean>(false);
  visibility$ = this.visibility.asObservable();

  show() {
    console.log('SpinnerService.show()')
    this.visibility.next(true);
  }

  hide() {
    console.log('SpinnerService.hide()');
    this.visibility.next(false);
  }
}