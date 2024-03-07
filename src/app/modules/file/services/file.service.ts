import { Injectable, inject } from '@angular/core';
import { CollectionReference, Firestore, collection, doc, onSnapshot } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { BehaviorSubject } from 'rxjs';
import { SpinnerService } from 'src/app/core/services/spinner.service';


@Injectable({
    providedIn: 'root'
})
export class FileService {
    private fs = inject(Firestore);
    private fileCollection: CollectionReference;
    private fileFormCollection: CollectionReference;
    private currFileForm$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private currFileFormSub$: any;

    constructor(
        private spinnerService: SpinnerService,
        private fns: Functions,
        
    ) {
        this.fileCollection = collection(this.fs, 'files');
        this.fileFormCollection = collection(this.fs, 'file-forms');
    }

    public async fetchFileForm(formId: string): Promise<any> {
        this.spinnerService.show();
        return new Promise((resolve, reject) => {
            const fileFormRef = doc(this.fileFormCollection, formId);
            this.currFileFormSub$ = onSnapshot(fileFormRef, (doc) => {
                if (doc.exists()) {
                    this.currFileForm$.next(doc.data());
                    resolve(true);
                } else {
                    reject('No such document!');
                }
                this.spinnerService.hide();
            });
        });
    }

    public getCurrentFileForm(): BehaviorSubject<any> {
        return this.currFileForm$;
    }
}