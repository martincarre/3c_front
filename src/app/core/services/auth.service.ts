import { Injectable, inject } from '@angular/core';
import { Auth, User, authState, createUserWithEmailAndPassword, signInWithEmailAndPassword, user } from '@angular/fire/auth';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ToastService } from './toast.service';
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
           this.subscribeToAuthState(); 
    };
     
    private subscribeToAuthState(): void {
        this.spinner.show();
        this.userSub$ = this.authState$
        .subscribe((user: User | null) => {
            console.log('user from core', user);
            // First making sure that a user is logged in
            if (user) {
                // Setting up the user depending on the role. If admin then no need to go check the user collection
                let isAdmin: boolean = false;
                // getting the user's claims via the idTokenResult
                user.getIdTokenResult().then((idTokenResult) => {
                    // setting isAdmin to true if the user is an admin
                    idTokenResult.claims['admin'] ? isAdmin = true : isAdmin = false
                    // if the user is not an admin then we need to get the user's data from the users collection
                    if (!isAdmin) {
                        // Getting the user's data from the users collection
                        const userRef = doc(this.userCollection, user.uid);
                        this.fsUserSub$ = onSnapshot(userRef, (userDoc) => {
                            // If the user exists then we set the user's data to the aUser$ BehaviorSubject
                            if (userDoc.exists()) {
                                const userData = userDoc.data();
                                // Transforming the user's data to the current user object
                                // TODO: add TP type and TP ID to the current user
                                const currUser =  { 
                                    uid: user.uid,
                                    email: user.email,
                                    name: userData['name'],
                                    surname: userData['surname'],
                                    role: userData['role'],
                                    mobile: userData['mobile'],
                                };
                                // Setting the current user to the aUser$ BehaviorSubject
                                this.aUser$.next(currUser);
                                this.spinner.hide();
                            } else {
                                // If the user does not exist then we set the aUser$ BehaviorSubject to null --> this shouldn't happen
                                this.aUser$.next(null);
                                alert('User does not exist in the users collection. This should not happen. Please contact the admin.');
                                console.error('User does not exist in the users collection. This should not happen. Please contact the admin.');
                                this.spinner.hide();
                            }
                        });
                    }
                    else {
                        // If the user is an admin then we set the user's data to the aUser$ BehaviorSubject
                        const currUser =  { 
                            uid: user.uid,
                            email: user.email,
                            role: 'admin',
                        };
                        this.aUser$.next(currUser);
                        this.spinner.hide();
                    }
            });
            }
            else { 
                // If the user is not logged in then we set the aUser$ BehaviorSubject to null
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