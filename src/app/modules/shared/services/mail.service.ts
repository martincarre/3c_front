import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

@Injectable({ providedIn: 'root' })
export class MailService {
  
    constructor(
        private fns: Functions,
    ) {}

    public async sendOperationEmail(mailId: string): Promise<any> {
        return await httpsCallable(this.fns, 'sendOperationEmail')(mailId);
    }

}