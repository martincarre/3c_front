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

    public async addUserByEmail(email: string, role: string, relatedPartner: string): Promise<any> {
        return await httpsCallable(this.fns, 'createUser')({ email: email, role: role, relatedPartnerId: relatedPartner });
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
}