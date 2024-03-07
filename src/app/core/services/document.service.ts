import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';


@Injectable({ providedIn: 'root' })
export class DocumentService {
    private fns: Functions = inject(Functions);

    constructor() {}
    
    public async createContract(data: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            await httpsCallable(this.fns, 'createContract')(data)
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
        });
    };

}