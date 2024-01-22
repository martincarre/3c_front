import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    private userCollection;

    constructor(
        private fs: Firestore,
        private fns: Functions,
    ) 
    {
       this.userCollection = collection(this.fs, 'users');
    }

    public async addUserByEmail(email: string, role: string, partnerId: string, partnerFiscalName: string): Promise<any> {
        return await httpsCallable(this.fns, 'createUser')({ email: email, role: role, partnerId: partnerId, partnerFiscalName: partnerFiscalName });
    }

    public async fetchUsers(partnerId?: string, userBased?: boolean): Promise<any> {
        const constraints: any[] = [];
        if (partnerId) {
            constraints.push(where('partnerId', '==', partnerId));
        }
        if (userBased) {
            // TODO
        }
        const q = query(this.userCollection, ...constraints);
        return (await getDocs(q)).docs.map(ops => {
        return { id: ops.id, ...ops.data() }
        });
    }

    public async checkFSUserByEmail(email: string): Promise<boolean> {
        console.log('Firestore:', email);
        const q = query(this.userCollection, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    }
}