import { Component, OnInit } from '@angular/core';
import { BackUser } from '../../models/user.model';
import { backUserFormFields } from '../../models/backuser.formly-form';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Location } from '@angular/common';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'back-app-user-details',
  templateUrl: './back-user-details.component.html',
  styleUrl: './back-user-details.component.scss'
})
export class BackUserDetailsComponent implements OnInit {
  aUserSub: Subscription = new Subscription();
  // TODO: add CustomerUser model?
  currBackUser: BackUser | null = null; 
  currBackUserId: string | null = null;

  currUserRole: string | null = null;
  currUserId: string | null = null;

  createMode: boolean = true;

  backUserFormField: FormlyFieldConfig[] = [];
  backUserForm: FormGroup = new FormGroup({});
  backUserModel: any;
  backUserOptions: FormlyFormOptions = {
    formState: {
      disabled: false,
      admin: false,
    },
  };

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private spinnerService: SpinnerService,
    private toastService: ToastService,
    private authService: AuthService,
  ) {
  }
  
  ngOnInit(): void {
    this.backUserFormField = backUserFormFields;

    this.aUserSub = this.authService.getAuthedUser()
      .subscribe((user) => {
        if (user) {
          console.log(user);
          this.currUserRole = user.role;
          this.currUserId = user.uid;
          if (this.currUserRole === 'admin') {
            this.backUserOptions.formState.admin = true;
          }
          console.log(this.backUserForm);
        }
    });

    this.currBackUserId = this.route.snapshot.params['id'];
    if (this.currBackUserId) {
      this.createMode = false;
      // TODO: fetch user by id
    }


  }

  onCreateBackUser(): void {
    // If there's no user role, don't do anything
    if (!this.currUserRole) {
      alert('No tiene permisos para crear un usuario');
      return;
    }

    this.spinnerService.show();
    const formData = this.backUserForm.value;

    // If the user is not an admin, they can't create a moderator
    if (this.currUserRole === 'moderator') {
      if (!formData.partner) { 
        alert('No tiene permisos para crear un moderador');
        this.spinnerService.hide();
        return;
      }
      formData.role = 'partner';
    }

    // If the backuser being created is a partner, we need to set the relatedTpId and delete the unnecessary partner field
    if (formData.role === 'partner') {
      formData.relatedTpId = formData.partner.id;
      formData.relatedTpName = formData.partner.fiscalName;
      formData.relatedTpFiscalId = formData.partner.fiscalId;
      delete formData.partner;
    }

    this.userService.createBackUser(formData)
    .then((res) => {
      if (res.data.success) {
        console.log('createBackUser', res);
        this.toastService.show('bg-success text-light', `Nuevo usuario creado con éxito`, 'Éxito!', 7000);
        this.router.navigate(['user']);
        this.spinnerService.hide();
      }
      else {
        alert('Error creating user');
        console.error('createBackUser', res.data);
        this.toastService.show('bg-danger text-light', res.data.message, 'Error!', 7000);
        this.spinnerService.hide();
      }
    })
    .catch((err) => {
      alert('Error creating user');
      console.error('createBackUser', err.data);
      this.toastService.show('bg-danger text-light', err.data.message, 'Error!', 7000);
      this.spinnerService.hide();
    });
  }

  close(): void {
    this.location.back();
  }

}
