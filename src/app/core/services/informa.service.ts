
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SpinnerService } from './spinner.service';
import { ToastService } from './toast.service';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InformaService {
    private apiUrls: any = environment.informa.apiUrls;
    private credentials: {user: string; password: string;} = environment.informa.credentials;
    private stateList$: BehaviorSubject<{label: string; value: string;}[]> = new BehaviorSubject<{label: string; value: string;}[]>([]);

    constructor(
        private http: HttpClient,
        private spinnerService: SpinnerService,
        private toastService: ToastService,
        private fns: Functions,
    ) {
        
    }

    public async getCompanyInfoByCif(tpFiscalId: string): Promise<any> {
        return await httpsCallable(this.fns, 'getInformaTpBasicInfo')({ tpFiscalId });
    };

    public getStateList(): Observable<{label: string; value: string;}[]> {
        return this.stateList$.asObservable();
    };

    public fetchStateListAndPublishToSubscribers(): void {
        this.spinnerService.show();
        httpsCallable(this.fns, 'getInformaStateList')(null)
            .then((res: any) => {
                const data = res.data;
                if (data.success) {
                    const stateListForSelect: {label: string; value: string;}[] = [];
                    for (let i = 0; i < data.stateList.length; i++) {
                        stateListForSelect.push({ label: data.stateList[i], value: data.stateList[i] })
                    }
                    console.log('stateListForSelect', stateListForSelect);
                    this.stateList$.next(stateListForSelect);
                    this.spinnerService.hide();
                }
                else {
                    this.spinnerService.hide();
                    alert('Error fetching state list');
                }
            })
            .catch((err: any) => {
                console.error('Error fetching state list', err);
            });
    };
};

