import { Injectable, inject } from '@angular/core';
import { CollectionReference, Firestore, collection, doc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { BehaviorSubject, Observable } from 'rxjs';
import { SpinnerService } from 'src/app/core/services/spinner.service';


@Injectable({
    providedIn: 'root'
})
export class ContractService {
    private fs: Firestore = inject(Firestore);
    private contractCollection: CollectionReference;
    private currContract$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private currContractSub$: any;

    constructor(
        private spinnerService: SpinnerService,
        private fns: Functions,
        
    ) {
        this.contractCollection = collection(this.fs, 'contracts');
    }

    public  getContractSignUrl(contractId: string): any {
        this.spinnerService.show();
        console.log('contractId', contractId);
        return httpsCallable(this.fns, 'sendContractForSignature')({contractId: contractId})
            .then((res: any) => {
                this.spinnerService.hide();
                return res.data;
            })
            .catch((err) => {
                this.spinnerService.hide();
                console.error(err);
                return err;
            });
    }

    public async fetchContractById(contractId: string): Promise<any> {
        const opRef = doc(this.contractCollection, contractId);
        return this.currContractSub$ = onSnapshot(opRef, (doc) => {
            if (doc.exists()) {
                this.currContract$.next(doc.data());
                return true;
            } else {
                // doc.data() will be undefined in this case
                console.log('No such document!');
                this.currContract$.next(null);
                return false;
            }
        });
    }

    public getCurrentContract(): BehaviorSubject<any> {
        return this.currContract$;
    };

    public changeSignStatusToCompleted(contractId: string): void {
        this.spinnerService.show();
        updateDoc(doc(this.contractCollection, contractId), {signStatus: 'completed'})
            .then(() => {
                this.spinnerService.hide();
            })
            .catch((err) => { 
                this.spinnerService.hide();
                console.error(err);
            });
    }

    public async unsubscribeCurrOperation(): Promise<any> {
        return await this.currContractSub$();
    };
}
