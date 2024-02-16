import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';

import { NgbModalModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastsContainer } from './components/toast/toast-container.component';
import { ToastGlobalComponent } from './components/toast/toast-global.component';
import { ConfirmationModalContent } from './components/confirmation-modal/confirmation-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SpinnerInterceptor } from './interceptors/spinner';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { environment } from 'src/environments/environment';


@NgModule({
  declarations: [
    ToastsContainer,
    SpinnerComponent,
    ToastGlobalComponent,
    ConfirmationModalContent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbToastModule,
    NgbModalModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => { 
      const firestore = getFirestore();
      connectFirestoreEmulator(firestore, 'localhost', 8080);
      return firestore;
    }),
    provideFunctions(() => { 
      const funcs = getFunctions();
      connectFunctionsEmulator(funcs, 'localhost', 5001);
      return funcs;
    }),
    provideAuth(() => {
      const auth = getAuth();
      connectAuthEmulator(auth, 'http://localhost:9099');
      return auth;
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true },
  ],
  exports: [
    ToastsContainer,
    SpinnerComponent,
    ConfirmationModalContent,
    NgbToastModule,
  ]
})
export class CoreModule { }

