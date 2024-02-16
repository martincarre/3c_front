import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-sign-in-modal',
  templateUrl: './sign-in-modal.component.html',
  styleUrl: './sign-in-modal.component.scss'
})
export class SignInModalComponent {
  private activeModal = inject(NgbActiveModal);
  private authService = inject(AuthService);
  signInForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
  ) { }
  
  close() {
    this.activeModal.dismiss();
  };

  signIn() {
    if (this.signInForm.invalid) { 
      alert('Por favor, rellene todos los campos');
      return;
    } else {
      this.authService.signIn(this.signInForm.value.email!, this.signInForm.value.password!)
        .then((res) => {
          this.activeModal.close(true);
        })
        .catch((err) => {
          console.error(err);
          alert('Error inesperado ver consola');
        });
    }
  }
}
