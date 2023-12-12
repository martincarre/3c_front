import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PV, PMT, RATE } from '@formulajs/formulajs'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private _rate: number = 0.1;
  private _periodicity: number = 12;

  constructor(
    private http: HttpClient
  ) { }

  public getQuote(ecoDetails: any): number | Error {
    const rate = ecoDetails.rate? ecoDetails.rate : this._rate;
    const commission = ecoDetails.commission? ecoDetails.commission : 0;
    const quote = PMT(rate/this._periodicity, ecoDetails.duration, -ecoDetails.amount * ( 1 + ecoDetails.margin + commission ), ecoDetails.rv * ecoDetails.amount, 1);
    const markedRate = RATE(ecoDetails.duration, PMT(rate/this._periodicity, ecoDetails.duration, -1 * ( 1 + ecoDetails.margin + commission ), 1 * ecoDetails.rv, 1), -1, 1 * ecoDetails.rv, 1, 0) * this._periodicity;
    const pv = PV(markedRate/this._periodicity, ecoDetails.duration, -ecoDetails.amount, -ecoDetails.rv * ecoDetails.amount, 1);
    if (ecoDetails.selector) {
      return quote;
    } else {
      return pv;
    }
  }
}
