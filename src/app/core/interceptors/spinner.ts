import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SpinnerService } from '../services/spinner.service';


@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
    
  constructor(private spinnerService: SpinnerService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('SpinnerInterceptor');
    let timer: any;

    // This function starts a timer that will show the spinner after XXms if not cleared
    const startTimer = () => {
      timer = setTimeout(() => {
        this.spinnerService.show();
      }, 150); // Set the delay. 
    };

    // This function clears the timer if it's still pending
    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    startTimer();

    return next.handle(req).pipe(
      tap(
        event => {
          if (event instanceof HttpResponse) {
            clearTimer();
            this.spinnerService.hide();
          }
        },
        error => {
          clearTimer();
          this.spinnerService.hide();
        }
      )
    );
  }
}