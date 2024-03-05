import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { ThirdpartyService } from '../../services/thirdparty.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { Thirdparty } from '../../models/thirdparty.model';
import { Subscription } from 'rxjs';
import { thirdpartyFormlyForm } from '../../models/thirdparty.formly-form';
import { ExtInfoService } from 'src/app/core/services/extInfo.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { DocumentService } from 'src/app/core/services/document.service';


@Component({
  selector: 'app-thirdpartydetail',
  templateUrl: './thirdpartydetail.component.html',
  styleUrls: ['./thirdpartydetail.component.scss']
})
export class ThirdpartydetailComponent implements OnInit, OnDestroy {
  createMode: boolean = true;
  currentId: string | undefined | null;
  editMode: boolean = false;
  currentTP: Thirdparty | undefined;
  currentUser: any;
  private auserSub: Subscription = new Subscription();
  private tpSub: Subscription = new Subscription();
  private submitSub: Subscription = new Subscription();

  tpForm = new FormGroup({});
  model = {};
  title: string = 'Nuevo tercero';
  fields: FormlyFieldConfig[];

  formOptions: FormlyFormOptions = {
    formState: {
      disabled: false,
      currUserCustomer: false
    },
  };

  constructor(
    private thirdpartyService: ThirdpartyService,
    private extInfoService: ExtInfoService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private spinnerService: SpinnerService,
    private authService: AuthService,
    private userService: UserService,
    private documentService: DocumentService,
  ) {
    this.fields = thirdpartyFormlyForm;
   }

  ngOnInit(): void {
    const fromCreate = this.route.snapshot.url[0].path === 'create' ? true : false;
    this.currentId = this.route.snapshot.params['id'];

    this.auserSub = this.authService.getAuthedUser().subscribe((user) => {
      console.log('user', user);
      if (user) {
        this.currentUser = user;
        this.currentUser.role === 'customer' ? this.formOptions.formState.currUserCustomer = true : this.formOptions.formState.currUserCustomer = false;
      }
    });

    if (this.currentId && !fromCreate) {
      this.spinnerService.show();
      this.createMode = false;
      this.formOptions.formState.disabled = true;
      this.thirdpartyService.fetchThirdPartyById(this.currentId);
      this.tpSub = this.thirdpartyService.getCurrentThirdparty()
        .subscribe((tp: Thirdparty) => {
          if (tp) {
            this.currentTP = tp;
            this.model = tp;
            this.title = tp.fiscalName;
            this.spinnerService.hide();
          }
        });
    }
    
  }

  tpLookUp(): void {
    const fiscalId = this.tpForm.get('fiscalId')?.value;
    if (fiscalId) {
      this.spinnerService.show();
      this.extInfoService.getTpInfo(fiscalId).subscribe((tpInfo: Thirdparty) => {
        console.log('response', tpInfo);
        this.currentTP = tpInfo;
        this.model = tpInfo;
        console.log('model', this.model);
        this.title = tpInfo.fiscalName;
        this.spinnerService.hide();
      });
    }
  }

  onEdit(): void {
    this.formOptions.formState.disabled = !this.formOptions.formState.disabled;
    this.editMode = !this.editMode;
  }

  onSubmit(): void {
    this.spinnerService.show();
    // Create Mode
    if (this.createMode) {
      let tp = { createdBy: this.currentUser.uid, ...this.tpForm.value}  as Thirdparty;
      this.thirdpartyService.addThirdparty(tp)
      .then(async res => {
        console.log(typeof res);
        await this.userService.addTpToUser(res.id, this.currentUser.uid);
        tp = { id: res.id, ...tp };
        if (this.currentUser && this.currentUser.role === 'customer') {
          // TODO Get to the contract printing step.
          // console.log(this.currentUser);
          // this.spinnerService.hide();
          
          const contractGenerationRes = await this.documentService.createContract({ user: this.currentUser, tp });
          console.log('contractId', contractGenerationRes);
          this.router.navigate(['/contract/contract-sign', contractGenerationRes.contractId]);
          this.spinnerService.hide();          
        } else {
          this.router.navigate(['/thirdparty/list']);
          this.toastService.show('bg-success text-light', `${tp.fiscalName} creado exitosamente!`, 'Éxito!', 7000);
          this.spinnerService.hide();
        }
      })
      .catch(err => {
        this.spinnerService.hide();
        console.error(err);
        this.toastService.show('bg-danger text-light', err, 'Error!', 7000);
      });
    }
    // Edit Mode
    else {
      const tp = { updatedBy: this.currentUser.uid, ...this.tpForm.value}  as Thirdparty;
      if (this.currentTP && this.currentId) { 
        this.thirdpartyService.updateThirdparty(this.currentId, tp)
        .then(res => {
          // TODO add the redirect if user is customer
          this.toastService.show('bg-success text-light', `${this.currentTP?.fiscalName} se ha actualizado con éxito!`, 'Éxito!', 7000);
          this.router.navigate(['/thirdparty/list']);
          this.spinnerService.hide();
        })
        .catch(err => {
          this.spinnerService.hide();
          console.error(err);
          this.toastService.show('bg-danger text-light', err, 'Error!', 7000);
        });
      } else { 
        console.error('No currentTP ID');
      }
    }
  }

  close(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.auserSub.unsubscribe();
    this.tpSub.unsubscribe();
    this.submitSub.unsubscribe();
  }

}


