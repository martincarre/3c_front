import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, where, query, getDocs, and, deleteDoc, doc, getDoc, updateDoc, collectionData, onSnapshot } from '@angular/fire/firestore';
import { Thirdparty } from '../models/thirdparty.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class ThirdpartyService {

  // Current Thirdparty variables
  private tpCollection;
  private currTp$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private currTpSub$: any;

  constructor(
    private fs: Firestore,
    private fns: Functions,
    private http: HttpClient,
  ) {
    this.tpCollection = collection(this.fs, 'thirdparties');
  }
  
  public async fetchThirdPartyById(id: string): Promise<any>{
    const tpRef = doc(this.tpCollection, id);
    return this.currTpSub$ = onSnapshot(tpRef, (doc) => {
      if (doc.exists()) {
        const tpData: any = {...doc.data(), id: doc.id };
        // Adapting the createdAt field to a Date object
        if (tpData['createdAt'] && tpData['createdAt'].seconds) {
            tpData['createdAt'] = new Date(tpData['createdAt'].seconds * 1000);
        }
        // Adapting the updatedAt field to a Date object
        if (tpData['updatedAt'] && tpData['updatedAt'].seconds) {
            tpData['updatedAt'] = new Date(tpData['updatedAt'].seconds * 1000);
        }
        // Adapting the mobile number for the user avoiding the country code
        if (tpData['phone']) {
            tpData['phone'] = tpData['mobile'].replace('+34', '');
        }
        this.currTp$.next(tpData);
        return true;
      } else {
        // doc.data() will be undefined in this case
        console.log('No such document!');
        this.currTp$.next(null);
        return false;
      }
    });
  }

  getCurrentThirdparty(): Observable<any> {
    return this.currTp$.asObservable();
  };

  public async checkFiscalId(fiscalId: string): Promise<any>{
    return await httpsCallable(this.fns, 'checkFiscalId')({ fiscalId });
  };
  
  public async addThirdparty(thirdparty: Thirdparty): Promise<any>{
    return await httpsCallable(this.fns, 'createTp')(thirdparty);
  };

  public async updateThirdparty(tpId: string, changes: any): Promise<any>{
    return await httpsCallable(this.fns, 'updateTp')({ tpId, changes});
  };

  public async deleteThirdparty(tpId: string): Promise<any>{
    return await httpsCallable(this.fns, 'deleteTp')({ tpId});
  };
  public fetchThirdparties(tpType?: string, userBased?: boolean): Observable<any[]> {
    const constraints: any[] = [];
    if (tpType) {
      constraints.push(where('tpType', '==', tpType));
    }
    if (userBased) {
      // TODO
    }
    const q = query(this.tpCollection, ...constraints);
    return collectionData(q, {idField: 'id'}) as Observable<any[]>;
  };
}
