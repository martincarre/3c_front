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
            return await httpsCallable(this.fns, 'createCustomer')({...customerInfo, authUid: authUid, role: 'customer'})
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

    public addOperationIdToUser(operationId: string, userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            return httpsCallable(this.fns, 'addOperationIdToUser')({operationId: operationId, userId: userId})
            .then((res: any) => {
                if (res) {
                    if (res.data.success) {
                        resolve(res.data);
                    } else {
                        reject(res.data);
                    }
                }
            })
            .catch((err) => {
                if (err) {
                    reject(err);
                }
            });
        }) 
    }

    public addTpToUser(tpId: string, userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            return httpsCallable(this.fns, 'addTpIdToUser')({tpId: tpId, userId: userId})
            .then((res: any) => {
                if (res) {
                    if (res.data.success) {
                        resolve(res.data);
                    } else {
                        reject(res.data);
                    }
                }
            })
            .catch((err) => {
                if (err) {
                    reject(err);
                }
            });
        })
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