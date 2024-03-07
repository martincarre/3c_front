import { Component, OnInit } from '@angular/core';
import { BackUser } from '../../models/user.model';
import { backUserFormFields } from '../../models/backuser.formly-form';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Location } from '@angular/common';
import { SpinnerService } from 'src/app/core/services/spinner.service';

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

  backUserFormField: FormlyFieldConfig[] = [];
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
    private location: Location,
    private spinnerService: SpinnerService,
  ) {
  }
  
  ngOnInit(): void {
    this.backUserFormField = backUserFormFields;
    this.currUserId = this.route.snapshot.params['id'];
    if (this.currUserId) {
      this.createMode = false;
      // TODO: fetch user by id
    }


  }

  onCreateBackUser(): void {
    this.spinnerService.show();
    const formData = this.backUserForm.value;
    formData.relatedTpId = formData.partner.id;
    const { partner, ...newBackUser } = formData;
    this.userService.createBackUser(newBackUser)
    .then((res) => {
      if (res.data.success) {
        console.log('createBackUser', res);
        this.router.navigate(['user']);
        this.spinnerService.hide();
      }
      else {
        alert('Error creating user');
        console.error('createBackUser', res.data);
        
        this.spinnerService.hide();
      }
    })
    .catch((err) => {
      alert('Error creating user');
      console.error('createBackUser', err.data);
      
      this.spinnerService.hide();
    });
  }

  close(): void {
    this.location.back();
  }

}
