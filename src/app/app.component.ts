import { Component, OnInit } from '@angular/core';
import { Observable, delay, startWith } from 'rxjs';
import { SpinnerService } from './core/services/spinner.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = '3c_front';
  isLoading$: Observable<boolean> = new Observable<boolean>();

  constructor(
    private spinnerService: SpinnerService,
  ) { }

  ngOnInit(): void {
    this.isLoading$ = this.spinnerService.visibility$.pipe(
      startWith(false),
      delay(0),
    );  
  }
}
