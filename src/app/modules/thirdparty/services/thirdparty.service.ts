import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, where, query, getDocs, and, deleteDoc, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Thirdparty } from '../models/thirdparty.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ThirdpartyService {
  private fs: Firestore = inject(Firestore);
  private tpCollection;

  constructor(
    private http: HttpClient
  ) {
    this.tpCollection = collection(this.fs, 'thirdparties');
  }

  
  public async fetchThirdPartyById(id: string): Promise<any>{
    const tpRef = doc(this.tpCollection, id);
    return await getDoc(tpRef);
  }
  
  public async addThirdparty(thirdparty: Thirdparty): Promise<any>{
    return await addDoc(this.tpCollection, thirdparty);
  }

  public async updateThirdparty(tpId: string, thirdparty: Thirdparty): Promise<any>{
    const tpRef = doc(this.tpCollection, tpId);
    return await updateDoc(tpRef, thirdparty as Partial<Thirdparty>);
  }

  public async deleteThirdparty(tpId: string): Promise<any>{
    const tpRef = doc(this.tpCollection, tpId);
    return await deleteDoc(tpRef);
  }

  public async fetchThirdparties(tpType?: string, userBased?: boolean): Promise<any> {
    const constraints: any[] = [];
    if (tpType) {
      constraints.push(where('tpType', '==', tpType));
    }
    if (userBased) {
      // TODO
    }
    const q = query(this.tpCollection, ...constraints);
    return (await getDocs(q)).docs.map(tps => {
      return { id: tps.id, ...tps.data() }
    });
  }
}
