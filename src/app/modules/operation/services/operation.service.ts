import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, where, query } from '@angular/fire/firestore';
import { PV, PMT, RATE } from '@formulajs/formulajs'

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private _rate: number = 0.1;
  private _periodicity: number = 12;
  private opCollection;

  constructor(
    private fs: Firestore,
  ) {
    this.opCollection = collection(this.fs,'operations');
  }

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

  public async fetchOperations(partnerId?: string, userBased?: boolean): Promise<any> {
    const constraints: any[] = [];
    if (partnerId) {
      constraints.push(where('tpType', '==', partnerId));
    }
    if (userBased) {
      // TODO
    }
    const q = query(this.opCollection, ...constraints);
    return (await getDocs(q)).docs.map(ops => {
      return { id: ops.id, ...ops.data() }
    });
  }

  public async createOperation(op: any, contactDetails?: any): Promise<any> {
    return await addDoc(this.opCollection, op);
  }
}