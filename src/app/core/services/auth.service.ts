import { Injectable, inject } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth: Auth = inject(Auth);
    user$ = user(this.auth);
    userSub: Subscription = new Subscription();

    constructor() {
        this.userSub = this.user$.subscribe();
    }

    
}