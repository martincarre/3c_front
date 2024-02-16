import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { AuthService } from 'src/app/core/services/auth.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    
    private userCollection;

    constructor(
        private fs: Firestore,
        private fns: Functions,
        private authService: AuthService,
        private spinnerService: SpinnerService,
    ) 
    {
       this.userCollection = collection(this.fs, 'users');
    };

    public async addUserByEmail(email: string, role: string, partnerId: string, partnerFiscalName: string): Promise<any> {
        return await httpsCallable(this.fns, 'createContact')({ email: email, role: role, partnerId: partnerId, partnerFiscalName: partnerFiscalName });
    };

    public async customerSignup(customerInfo: any): Promise<any> {
        this.spinnerService.show();
        return await this.authService.signUp(customerInfo.email, customerInfo.password)
        .then(async (authRes) => {
            const authUid = authRes.user.uid;
            console.log(authRes);
            return await httpsCallable(this.fns, 'createCustomer')({...customerInfo, authUid: authUid})
            .then((userRes) => {
                console.log(userRes);
                this.spinnerService.hide();
                
            });
        })
        .catch((err) => {
            console.error(err);
            this.spinnerService.hide();
            return;
        });
    };

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
    };

    public async checkFSUserByEmail(email: string): Promise<boolean> {
        console.log('Firestore:', email);
        const q = query(this.userCollection, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    };
};