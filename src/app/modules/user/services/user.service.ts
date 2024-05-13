import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDocs, onSnapshot, query, where } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { BehaviorSubject, Observable } from 'rxjs';
import { BackUser } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    
    private userCollection;
    private currUserSub$: any;
    private currUser$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        private fs: Firestore,
        private fns: Functions,
    ) 
    {
       this.userCollection = collection(this.fs, 'users');
    };

    public async customerSignup(customerInfo: any): Promise<any> {
        return await httpsCallable(this.fns, 'createCustomer')({...customerInfo, role: 'customer'})
        .then((userRes) => {
            console.log(userRes);
        });
    };

    public async createBackUser(backUserInfo: BackUser): Promise<any> {
        console.log(backUserInfo);
        return await httpsCallable(this.fns, 'createBackUser')(backUserInfo);
    };

    public async verifyBackUser(token: string, formValue: { email: string, password: string, passwordConfirm: string }): Promise<any> {
        return await httpsCallable(this.fns, 'verifyBackUser')({token: token, password: formValue.password, email: formValue.email});
    };

    public async deleteBackUser(userId: string): Promise<any> {
        return await httpsCallable(this.fns, 'deleteBackUser')({userId: userId});
    };

    public async fetchUserById(userId: string): Promise<any> {
        const userRef = doc(this.userCollection, userId);
        return this.currUserSub$ = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
            const userData = doc.data();
            if (userData['createdAt'] && userData['createdAt'].seconds) {
                userData['createdAt'] = new Date(userData['createdAt'].seconds * 1000);
            }
            this.currUser$.next(userData);
            return true;
        } else {
            // doc.data() will be undefined in this case
            console.log('No such document!');
            this.currUser$.next(null);
            return false;
        }
        });
    };

    public getCurrentUser(): Observable<any> {
        return this.currUser$.asObservable();
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
    };

    public addTpToUser(tpId: string, userId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            return httpsCallable(this.fns, 'addTpToUser')({tpId: tpId, userId: userId})
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