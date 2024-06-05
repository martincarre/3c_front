import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { ThirdpartyService } from '../../services/thirdparty.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { Thirdparty } from '../../models/thirdparty.model';
import { Subscription } from 'rxjs';
import { createThirdpartyFormlyFormConfig } from '../../models/thirdparty.formly-form';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { DocumentService } from 'src/app/core/services/document.service';
import { FormHelper } from 'src/app/modules/shared/utilities/formHelpers';
import { InformaService } from 'src/app/core/services/informa.service';


@Component({
  selector: 'app-thirdpartydetail',
  templateUrl: './thirdpartydetail.component.html',
  styleUrls: ['./thirdpartydetail.component.scss']
})
export class ThirdpartydetailComponent implements OnInit, OnDestroy {
  createMode: boolean = true;
  currentId: string | undefined | null;
  editMode: boolean = false;
  currentTP: Thirdparty | null = null;
  currentUser: any;
  private auserSub: Subscription = new Subscription();
  private tpSub: Subscription = new Subscription();
  private submitSub: Subscription = new Subscription();
  private initialTpModel: any;

  tpForm = new FormGroup({});
  model = {};
  title: string = 'Nuevo tercero';
  fields: FormlyFieldConfig[];

  formOptions: FormlyFormOptions = {
    formState: {
      disabled: false,
      currUserCustomer: false,
      currUserModerator: false,
      editMode: false,
    },
  };

  constructor(
    private thirdpartyService: ThirdpartyService,
    private injector: Injector,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private spinnerService: SpinnerService,
    private authService: AuthService,
    private documentService: DocumentService,
  ) {
    this.fields = createThirdpartyFormlyFormConfig(this.injector);
   }

  ngOnInit(): void {
    this.createMode = this.route.snapshot.url[0].path === 'create' ? true : false;
    this.createMode ? this.formOptions.formState.editMode = false : this.formOptions.formState.editMode = true;
    this.currentId = this.route.snapshot.params['id'];

    this.auserSub = this.authService.getAuthedUser().subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.currentUser.role === 'customer' ? this.formOptions.formState.currUserCustomer = true : this.formOptions.formState.currUserCustomer = false;
        this.currentUser.role === 'moderator' ? this.formOptions.formState.currUserModerator = true : this.formOptions.formState.currUserModerator = false;
      }
    });
    if (this.currentId && !this.createMode) {
      this.spinnerService.show();
      this.formOptions.formState.disabled = true;
      this.thirdpartyService.fetchThirdPartyById(this.currentId);
      this.tpSub = this.thirdpartyService.getCurrentThirdparty()
        .subscribe((tp: Thirdparty | null) => {
          if (tp) {
            this.currentTP = tp;
            this.model = {
              Iban: tp.Iban,
              address: tp.address,
              addressComp: tp.addressComp,
              city: tp.city,
              companyType: tp.companyType,
              fiscalId: tp.fiscalId,
              fiscalName: tp.fiscalName,
              postalCode: tp.postalCode,
              state: tp.state,
              tpType: tp.tpType,
            };
            this.initialTpModel = { ...this.model };
            this.title = tp.fiscalName;
            this.spinnerService.hide();
          }
        });
    };
  }

  // TODO: Work on this
  // tpLookUp(): void {
  //   const fiscalId = this.tpForm.get('fiscalId')?.value;
  //   if (fiscalId) {
  //     this.spinnerService.show();
  //     this.extInfoService.getTpInfo(fiscalId).subscribe((tpInfo: Thirdparty) => {
  //       console.log('response', tpInfo);
  //       this.currentTP = tpInfo;
  //       this.model = tpInfo;
  //       console.log('model', this.model);
  //       this.title = tpInfo.fiscalName;
  //       this.spinnerService.hide();
  //     });
  //   }
  // }

  onEdit(): void {
    this.formOptions.formState.disabled = !this.formOptions.formState.disabled;
    this.editMode = !this.editMode;
  }

  onSubmit(): void {
    // First check that there's a user and that the user is not a partner
    if (!this.currentUser && this.currentUser.role !== 'partner') {
      console.error('No user found');
      return;
    };
    this.spinnerService.show();
    // Create Mode
    if (this.createMode) {
      this.createTp();
    }
    // Edit Mode
    else {
      this.updateTp();
    }
  }

  // Helper function to create a new Thirdparty
  private createTp(): void {
    let tp = this.tpForm.value as Thirdparty;
    // Depending on the user we need to make sure that there's a corresponding TPType or the server's going to complain.
    if (!tp.tpType) {
      switch (this.currentUser.role) {
        case 'moderator':
          tp.tpType = 'partner';
          break;
        case 'customer':
          tp.tpType = 'client';
          break;
        default:
          this.toastService.show('bg-danger text-light', 'Hay un error en el formulario. Se requiere especificar la tipologia de tercero...', 'Error!', 7000);
          break;
      }
    }
    this.thirdpartyService.addThirdparty(tp)
    .then(async (res: any) => {
        if (res.data.success) { 
          // Put the toast here
          this.toastService.show('bg-success text-light', res.data.message , 'Éxito!', 7000);

          // If the user is a customer, then we need to create the contract
          if (this.currentUser.role === 'customer') {
            
          const newTpId = res.data.tpId;
          // If the newTpId is null, then there was an error creating the TP
          if (!newTpId) {
            this.spinnerService.hide();
            alert('Error creating TP');
          }
            // First include the newTpId in the tp object
            tp = { id: newTpId, ...tp };
            // Create the contract
            const contractGenerationRes = await this.documentService.createContract({ user: this.currentUser, tp });
            // Then navigate to the contract sign page
            this.router.navigate(['/contract/contract-sign', contractGenerationRes.contractId]);
            this.spinnerService.hide();
          } 
          // Else it comes from the admin or moderator then just navigate to the list.
          else {
            this.router.navigate(['/thirdparty/list']);
            this.spinnerService.hide();
          }
        }
        else {
          this.toastService.show('bg-danger text-light', res.data.message, 'Error!', 7000);
          this.spinnerService.hide();
        }
      })
      .catch(err => {
        this.toastService.show('bg-danger text-light', err.data.message, 'Error!', 7000);
        this.spinnerService.hide();
        console.error('err', err);
      });
  };

  // Helper function to update a new Thirdparty
  private updateTp(): any {
    if (!this.currentTP) {
      console.error('No current TP found');
      return;
    }
    else {
      // Check if there are changes
      const changes = FormHelper.getFormChanges(this.initialTpModel, this.tpForm.value);
      console.log('changes', changes);
      console.log('initialTpModel', this.initialTpModel);
      console.log('tpForm', this.tpForm.value);
      if (FormHelper.isEmptyObject(changes)) {
        console.log('No changes were detected');
        alert('No has hecho ningún cambio...');
      };
      console.log('changes', changes);
  
      this.thirdpartyService.updateThirdparty(this.currentTP.id! ,changes) 
          .then(res => {
            if (res.data.success) {
              this.toastService.show('bg-success text-light', `${this.currentTP?.fiscalName} se ha actualizado con éxito!`, 'Éxito!', 7000);
              // TODO Redirect elsewhere if customer
              if (this.currentUser.role === 'customer') {
                alert('Redirect to elsewhere');
              } else {
                this.router.navigate(['/thirdparty/list']);
              }
            } 
            else {
              this.toastService.show('bg-danger text-light', res.data.message, 'Error!', 7000);
            }
            this.spinnerService.hide();
          })
          .catch(err => {
            console.error(err);
            this.toastService.show('bg-danger text-light', err, 'Error!', 7000);
            this.spinnerService.hide();
          });
    }
  };

  close(): void {
    this.location.back();
  };

  ngOnDestroy(): void {
    this.auserSub.unsubscribe();
    this.tpSub.unsubscribe();
    this.submitSub.unsubscribe();
  }

}
