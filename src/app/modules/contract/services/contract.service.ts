import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { SpinnerService } from 'src/app/core/services/spinner.service';


@Injectable({
    providedIn: 'root'
})
export class ContractService {
    constructor(
        private spinnerService: SpinnerService,
        private fns: Functions,
        
    ) {}

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
}
