import { Component, OnInit } from '@angular/core';
import { BackUser } from '../../models/user.model';
import { backUserFormFields } from '../../models/backuser.formly-form';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent implements OnInit {
  // TODO: add CustomerUser model?
  currUser: BackUser | null = null; 
  currUserId: string | null = null; 

  createMode: boolean = true;

  backUserFormField: FormlyFieldConfig[];
  backUserForm: FormGroup = new FormGroup({});
  backUserModel: any;
  backUserOptions: FormlyFormOptions = {
    formState: {
      disabled: false,
    },
  };

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.backUserFormField = backUserFormFields;
  }

  ngOnInit(): void {
    this.currUserId = this.route.snapshot.params['id'];
    if (this.currUserId) {
      this.createMode = false;
      // TODO: fetch user by id
    }


  }

  onCreateBackUser(): void {
    console.log('onCreateBackUser', this.backUserForm.value);
  }

}


// const newUser = {
//   email: data.email,
//   name: data.name,
//   surname: data.surname,
//   mobile: data.mobile,
//   createdBy: authData.uid,
//   createdAt: Timestamp.now(),
//   updatedBy: null,
//   updatedAt: null,
//   managedTpIds: data.managedTpIds ? data.managedTpIds : [],
//   relatedTpId: data.relatedTpId,
//   role: data.role,
// };