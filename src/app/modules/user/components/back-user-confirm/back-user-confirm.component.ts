import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { UserService } from '../../services/user.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { backUserConfirmationFields } from '../../models/backuser.formly-form';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignInModalComponent } from 'src/app/modules/shared/components/sign-in-modal/sign-in-modal.component';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-back-user-confirm',
  templateUrl: './back-user-confirm.component.html',
  styleUrl: './back-user-confirm.component.scss'
})
export class BackUserConfirmComponent implements OnInit {
  private token: string | null = null;
  uid: string | null = null;
  confirmationForm: FormGroup = new FormGroup({});
  confirmationFields: FormlyFieldConfig[] = backUserConfirmationFields;
  confirmationModel: any = {};
  confirmationOptions: any = {};

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private spinnerService: SpinnerService,
    private router: Router,
    private modalService: NgbModal,
    private toastService: ToastService,
  ) { }
  
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      alert('No token provided');
      // TODO: Redirect
    }
    console.log(this.token);
  }

  onSubmit(): void { 
    if (this.token) {
      this.spinnerService.show();
      this.userService.verifyBackUser(this.token, this.confirmationForm.value)
      .then((res) => {
        if (res.data.success) {
          this.toastService.show('bg-success text-light', `Usuario verificado y contraseña establecida con éxito`, 'Éxito!', 7000);
          this.router.navigate(['/']);
          this.modalService.open(SignInModalComponent);
        } else {
          if (res.data.expired) {
            this.toastService.show('bg-danger text-light', res.data.message, 'Solicitud expirada!', 7000);
            this.router.navigate(['/']);
          } else {
            this.toastService.show('bg-danger text-light', res.data.message, 'Error!', 7000);
          }
        }
        this.spinnerService.hide();
      })
      .catch((err) => {
        this.spinnerService.hide();
        alert(err);
      });
    }
  }
}
