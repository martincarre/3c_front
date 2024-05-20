import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDocs, onSnapshot, query, where } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { BehaviorSubject, Observable, Subject, Subscription, map, takeUntil } from 'rxjs';
import { BackUser } from '../models/user.model';
import { TypeaheadService } from '../../shared/services/typeahead.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    
    private userCollection;
    private currUserSub$: any;
    private currUser$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    private destroy$: Subject<any> = new Subject<any>();

    constructor(
        private fs: Firestore,
        private fns: Functions,
        private typeaheadService: TypeaheadService,
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
        return await httpsCallable(this.fns, 'createBackUser')(backUserInfo);
    };

    public async verifyBackUser(token: string, formValue: { email: string, password: string, passwordConfirm: string }): Promise<any> {
        return await httpsCallable(this.fns, 'verifyBackUser')({token: token, password: formValue.password, email: formValue.email});
    };

    public async confirmBackUserMail (email: string): Promise<any> {
        // TODO: Need to handle expired links. Right now it's providing in the browser the following JSON: 
        // {
        //     "authEmulator": {
        //       "error": "Your request to verify your email has expired or the link has already been used.",
        //       "instructions": "Try verifying your email again."
        //     }
        // }
        return await httpsCallable(this.fns, 'confirmBackUserMail')({email: email});
    };

    public async updateBackUser(userId: string, changes: any): Promise<any> {
        return await httpsCallable(this.fns, 'updateBackUser')({userId: userId, changes: changes});
    }

    public async deleteBackUser(userId: string): Promise<any> {
        return await httpsCallable(this.fns, 'deleteBackUser')({userId: userId});
    };

    public async fetchUserById(userId: string): Promise<any> {
        const userRef = doc(this.userCollection, userId);
        return this.currUserSub$ = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
            const userData = doc.data();
            // Adapting the createdAt field to a Date object
            if (userData['createdAt'] && userData['createdAt'].seconds) {
                userData['createdAt'] = new Date(userData['createdAt'].seconds * 1000);
            }
            // Adapting the updatedAt field to a Date object
            if (userData['updatedAt'] && userData['updatedAt'].seconds) {
                userData['updatedAt'] = new Date(userData['updatedAt'].seconds * 1000);
            }
            // Adapting the mobile number for the user avoiding the country code
            if (userData['mobile']) {
                userData['mobile'] = userData['mobile'].replace('+34', '');
            }
            // Adding the partner to the user data if required: hence if it's not an moderator
            if (userData['relatedTpId'] && userData['relatedTpId'] !== 'admin') {
                this.typeaheadService.getThirdparties()
                .pipe(takeUntil(this.destroy$))
                .subscribe((data: any) => {
                    const partner = data.find((tp: any) => tp.id === userData['relatedTpId']);
                    if (partner) {
                        this.destroy$.next(true);
                        userData['partner'] = partner;
                    }
                });
            }
            // providing the user data to the observable
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