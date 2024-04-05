import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { signupFormFields } from '../../models/signup.formly-form';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomerGdprModalComponent } from 'src/app/modules/shared/components/customer-gdpr-modal/customer-gdpr-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from '../../services/user.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-signup',
  templateUrl: './user-signup.component.html',
  styleUrl: './user-signup.component.scss'
})
export class UserSignupComponent implements OnInit, OnDestroy{
  private aUserSub: Subscription = new Subscription();
  authed: boolean = false;
  signUpForm: FormGroup = new FormGroup({});
  signUpModel: any;
  signUpFields: FormlyFieldConfig[];
  signUpOptions: FormlyFormOptions = {};
  operationId: string | null = null;

  constructor (
    private modalService: NgbModal,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private spinnerService: SpinnerService,
  ) {
    this.signUpFields = signupFormFields;
  }

  ngOnInit(): void { 
    this.operationId = this.route.snapshot.params['id'];
    if (!this.operationId) {
      alert('Operación no encontrada');
      this.router.navigate(['/']);
    };

    this.aUserSub = this.authService.getAuthedUser().subscribe((aUser: any) => {
      if (aUser) {
        this.authed = true;
      };
    });

  }

  onSignUp() {
    this.spinnerService.show(); 
    const gdprModal = this.modalService.open(CustomerGdprModalComponent, { fullscreen: true });
    gdprModal.result.then(async (result) => {
      await this.userService.customerSignup({...result, ...this.signUpForm.value, operations: [this.operationId]})
        .then((res) => {
          if (this.authed) {
            alert('Usuario creado');
            this.router.navigate(['/thirdparty/create']);
            this.spinnerService.hide();
          }
        })
        .catch((err) => {
          console.error(err);
          alert('Error ver consola');
          this.spinnerService.hide();
          return;
        })
    })
    .catch((err) => {
      console.log(err);
    });
  }

  ngOnDestroy(): void {
    this.aUserSub.unsubscribe();
  }

}
