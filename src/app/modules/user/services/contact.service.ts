import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({
    providedIn: 'root'
  })
export class ContactService {
    private contactCollection;

    constructor(
        private fs: Firestore,
        private fns: Functions,
    ) 
    {
       this.contactCollection = collection(this.fs, 'contacts');
    }

    public async addContactByEmail(email: string, role: string, partnerId: string, partnerFiscalName: string): Promise<any> {
        return await httpsCallable(this.fns, 'createContact')({ email: email, role: role, partnerId: partnerId, partnerFiscalName: partnerFiscalName });
    };

    public async fetchContactsByPartner(partnerId: string): Promise<any> {
        const q = query(this.contactCollection, where('partnerId', '==', partnerId));
        return (await getDocs(q)).docs.map(ops => {
            return { id: ops.id, ...ops.data() }
        });
    };

    public async checkContactByEmail(email: string): Promise<any> {
        return await httpsCallable(this.fns, 'checkContactByEmail')({ email: email });
    };
}