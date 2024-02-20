import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, getDocs, query, where } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable } from 'rxjs';
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

    public fetchUsers(partnerId?: string, userBased?: boolean): Observable<any[]> {
        const constraints: any[] = [];
        if (partnerId) {
            constraints.push(where('partnerId', '==', partnerId));
        }
        if (userBased) {
            // TODO
        }
        const q = query(this.userCollection, ...constraints);
       return collectionData(q, {idField: 'id'}) as Observable<any[]>;
    };
};