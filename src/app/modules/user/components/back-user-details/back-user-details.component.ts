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
import { FormHelper } from 'src/app/modules/shared/utilities/formHelpers';

@Component({
  selector: 'back-app-user-details',
  templateUrl: './back-user-details.component.html',
  styleUrl: './back-user-details.component.scss'
})
export class BackUserDetailsComponent implements OnInit {
  aUserSub: Subscription = new Subscription();
  // TODO: add CustomerUser model?
  currBackUser: BackUser | null = null;
  currBackUserSub: Subscription = new Subscription(); 
  currBackUserId: string | null = null;
  initialBackUserModel: any;
  

  currUserRole: string | null = null;
  currUserId: string | null = null;

  createMode: boolean = true;
  editMode: boolean = false; 

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
      this.editMode = false;
      this.backUserOptions.formState.disabled = true;
      this.userService.fetchUserById(this.currBackUserId);
      // TODO: fetch user by id
      this.currBackUserSub = this.userService.getCurrentUser()
        .subscribe((user: BackUser) => {
          console.log(user);
          if (user) {
            this.currBackUser = user;
            this.backUserModel = {
              email: user.email,
              name: user.name,
              surname: user.surname,
              mobile: user.mobile,
              role: user.role,
              partner: user.partner,
            };
            this.initialBackUserModel = { ...this.backUserModel };
          }
        });
    };
  }

  onEdit(): void {
    this.backUserOptions.formState.disabled = !this.backUserOptions.formState.disabled;
    this.editMode = !this.editMode;
  }

  onSubmitBackUser(): void {
    if (this.createMode) {
      this.onCreateBackUser();
    } else if (this.editMode) {
      this.onUpdateBackUser();
    }
  };

  onUpdateBackUser(): void {
    // If there's no user id, don't do anything
    if (!this.currBackUserId) {
      console.error('No user id found');
      alert('No se ha encontrado el id del usuario, esto no deberia de haber pasado... Por favor contacte con soporte técnico.');
      return;
    };

    // if it's a moderator modyfying the role then she/he can't change the role
    if (!this.backUserForm.value.role) {
      this.backUserForm.value.role = this.initialBackUserModel.role;
    };

    // Chack if there are changes to the backuser
    const changes = FormHelper.getFormChanges(this.initialBackUserModel, this.backUserForm.value);
    if (FormHelper.isEmptyObject(changes)) {
      console.log('No changes were detected');
      alert('No has hecho ningún cambio...');
      return;
    };

    // If the backuser's change is related to its tp, we need to adapt the changes to what's expected in the backend;
    if (changes.partner) {
      changes.relatedTpId = changes.partner.id;
      changes.relatedTpName = changes.partner.fiscalName;
      changes.relatedTpFiscalId = changes.partner.fiscalId;
      delete changes.partner;
    };

    // Everything is ready to update the backuser
    this.spinnerService.show();
    this.userService.updateBackUser(this.currBackUserId!, changes)
      .then((res) => {
        // Success
        if (res.data.success) {
          console.log('updateBackUser', res);
          this.toastService.show('bg-success text-light', `Usuario actualizado con éxito`, 'Éxito!', 7000);
          this.router.navigate(['user']);
          this.spinnerService.hide();
        }
        // Backend "expected" potential errors
        else {
          alert('Error updating user');
          console.error('updateBackUser', res.data);
          this.toastService.show('bg-danger text-light', res.data.message, 'Error!', 7000);
          this.spinnerService.hide();
        }
      })
      // Unexpected errors
      .catch((err) => {
        alert('Error updating user');
        console.error('updateBackUser', err.data);
        this.toastService.show('bg-danger text-light', err.data.message, 'Error!', 7000);
        this.spinnerService.hide();
      });
  };

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
