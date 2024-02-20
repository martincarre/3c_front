import { Injectable, inject } from '@angular/core';
import { Auth, AuthError, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, user } from '@angular/fire/auth';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth: Auth = inject(Auth);
    private user$ = user(this.auth);
    private authState$ = authState(this.auth);
    
    constructor(
        private fns: Functions,
        private toastService: ToastService
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
        return createUserWithEmailAndPassword(this.auth, email, password).catch((error) => {
            const errorMessage = this.getErrorMessage(error.code);
            this.toastService.show('bg-danger text-light', errorMessage, 'Error!', 3000);
        });
    }

    public signOut(): Promise<any> {
        return this.auth.signOut();
    };

    public async signIn(email: string, password: string): Promise<any> {
        return signInWithEmailAndPassword(this.auth, email, password).catch((error) => {
            const errorMessage = this.getErrorMessage(error.code);
            this.toastService.show('bg-danger text-light', errorMessage, 'Error!', 5000); // Display the toast message
        });
    }

    private getErrorMessage(code: string): string {
        const errorMessages: { [key: string]: string } = {
            'auth/email-already-in-use': 'El email ya está en uso. Por favor, intenta con otro.',
            'auth/user-not-found': 'No encontramos un usuario con ese email. Por favor, verifica o registrate.',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/invalid-email': 'Por favor revisa el email ingresado, no parece ser valido',
            // Add more as needed
        };

        return errorMessages[code] || 'An error occurred. Please try again.';
    }

}