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
  private fs: Firestore = inject(Firestore);
  private fns: Functions = inject(Functions);
  private tpCollection;

  // Current Thirdparty variables
  private currTp$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private currTpSub$: any;

  constructor(
    private http: HttpClient
  ) {
    this.tpCollection = collection(this.fs, 'thirdparties');
  }
  
  public async fetchThirdPartyById(id: string): Promise<any>{
    const tpRef = doc(this.tpCollection, id);
    return this.currTpSub$ = onSnapshot(tpRef, (doc) => {
      if (doc.exists()) {
        this.currTp$.next(doc.data());
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
  
  public async addThirdparty(thirdparty: Thirdparty): Promise<any>{
    return await httpsCallable(this.fns, 'createTp')(thirdparty);
  }

  public async updateThirdparty(tpId: string, thirdparty: Thirdparty): Promise<any>{
    const tpRef = doc(this.tpCollection, tpId);
    return await updateDoc(tpRef, thirdparty as Partial<Thirdparty>);
  }

  public async deleteThirdparty(tpId: string): Promise<any>{
    const tpRef = doc(this.tpCollection, tpId);
    return await deleteDoc(tpRef);
  }

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
  }
}
