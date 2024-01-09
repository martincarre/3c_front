import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, where, query, deleteDoc, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MailService {

    private mailCollection;

    constructor(
        private fs: Firestore,
    ) {
        this.mailCollection = collection(this.fs,'mail');
    }

    public async fetchMailById(id: string): Promise<any> {
        const opRef = doc(this.mailCollection, id);
        return (await getDoc(opRef)).data();
    }
}