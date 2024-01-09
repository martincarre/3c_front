import { Injectable, inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth: Auth = inject(Auth);
    user$ = user(this.auth);
    userSub: Subscription = new Subscription();

    constructor(
        private fns: Functions,
    ) {
        this.userSub = this.user$.subscribe();
    }

    public async checkAuthUserEmail(email: string): Promise<any> {
        console.log('Auth:', email);
        return await httpsCallable(this.fns, 'checkUserEmail')({ email: email });
    }

    
}