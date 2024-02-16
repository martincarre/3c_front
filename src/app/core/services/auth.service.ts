import { Injectable, inject } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, user } from '@angular/fire/auth';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth: Auth = inject(Auth);
    private user$ = user(this.auth);
    private authState$ = authState(this.auth);
    
    constructor(
        private fns: Functions,
    ) {
    };

    public getAuthedUser(): Observable<any>{ 
        return this.user$;
    };

    public getAuthState(): Observable<any> {
        return this.authState$;
    };

    public async checkAuthUserEmail(email: string): Promise<any> {
        return await httpsCallable(this.fns, 'checkUserEmail')({ email: email });
    };

    public async signUp(email: string, password: string): Promise<any> {
        return await createUserWithEmailAndPassword(this.auth, email, password);
    };

    public signOut(): Promise<any> {
        return this.auth.signOut();
    };

    public signIn(email: string, password: string): Promise<any> {
        return signInWithEmailAndPassword(this.auth, email, password);
    }

}