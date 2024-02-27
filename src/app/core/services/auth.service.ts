import { Injectable, inject } from '@angular/core';
import { Auth, User, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, user } from '@angular/fire/auth';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { BehaviorSubject, Observable, Subscription, map } from 'rxjs';
import { ToastService } from './toast.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { Firestore, collection, doc, onSnapshot } from '@angular/fire/firestore';
import { SpinnerService } from './spinner.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth: Auth = inject(Auth);
    private user$ = user(this.auth);
    private authState$ = authState(this.auth);
    private aUser$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private userSub$: Subscription = new Subscription();
    private userCollection = collection(this.fs, 'users');
    private fsUserSub$: any;
    
    constructor(
        private fns: Functions,
        private fs: Firestore,
        private toastService: ToastService,
        private spinner: SpinnerService,
        private router: Router
    ) 
        {   
            this.spinner.show();
            this.userSub$ = this.authState$
            .subscribe((user: any) => {
                if (user) {
                    const userRef = doc(this.userCollection, user.uid);
                    this.fsUserSub$ = onSnapshot(userRef, (userDoc) => {
                        if (userDoc.exists()) {
                            const userData = userDoc.data();

                            // TODO: add TP type and TP ID to the current user
                            console.log(userData);
                            const currUser =  { 
                                uid: user.uid,
                                email: user.email,
                                name: userData['name'],
                                surname: userData['surname'],
                                role: userData['role'],
                                mobile: userData['mobile'],
                            };
                            this.aUser$.next(currUser);
                            this.spinner.hide();
                        } else {
                            this.aUser$.next(null);
                            this.spinner.hide();
                        }
                    });
                }
                else { 
                    this.aUser$.next(null);
                    this.spinner.hide();
                }
            });
        };

    public getAuthedUser(): Observable<any>{ 
        return this.aUser$ as Observable<any>;
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
    };

    public signOut(): Promise<any> {
        this.spinner.show();
        return this.auth.signOut()
        .then(() => {
            console.log('User signed out');
            this.aUser$.next(null);
            this.router.navigate(['/']);
            this.userSub$.unsubscribe();
            this.spinner.hide();
        });
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