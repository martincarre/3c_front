import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/modules/user/services/user.service';

@Component({
  selector: 'app-sign-in-modal',
  templateUrl: './sign-in-modal.component.html',
  styleUrl: './sign-in-modal.component.scss'
})
export class SignInModalComponent implements OnInit {
  private activeModal = inject(NgbActiveModal);
  private authService = inject(AuthService);
  @Input() private data: any;
  private fromOp: boolean = false;
  private opId: string | null = null;

  signInForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    if (this.data && this.data.opId) {
      this.fromOp = true;
      this.opId = this.data.opId;
    }
  }
  
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
          if (this.fromOp) {
            this.userService.addOperationIdToUser(this.opId!, res.user.uid)
              .then((res) => {
                this.activeModal.close(true);
              })
              .catch((err) => {
                console.error(err);
                alert('Error inesperado ver consola');
              });
          } else if (res) { 
            this.activeModal.close(true);
          }
        })
    }
  }
}
