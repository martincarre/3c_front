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
import { DocumentSnapshot } from '@angular/fire/firestore';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { Location } from '@angular/common';


@Component({
  selector: 'app-thirdpartydetail',
  templateUrl: './thirdpartydetail.component.html',
  styleUrls: ['./thirdpartydetail.component.scss']
})
export class ThirdpartydetailComponent implements OnInit, OnDestroy {
  createMode: boolean = true;
  currentId: string | undefined | null;
  editMode: boolean = false;
  private currentTP: Thirdparty | undefined;
  private tpSub: Subscription = new Subscription();
  private submitSub: Subscription = new Subscription();

  tpForm = new FormGroup({});
  model = {};
  title: string = 'Nuevo tercero';
  fields: FormlyFieldConfig[];

  formEditMode: FormlyFormOptions = {
    formState: {
      disabled: false,
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
  ) {
    this.fields = thirdpartyFormlyForm;
   }

  ngOnInit(): void {
    const fromCreate = this.route.snapshot.url[0].path === 'create' ? true : false;
    this.currentId = this.route.snapshot.params['id'];
    console.log(this.currentId );
    if (this.currentId && !fromCreate) {
      this.createMode = false;
      this.formEditMode.formState.disabled = true;
      this.fetchThirdParty(this.currentId);
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

  private fetchThirdParty(id: string): void {
    this.spinnerService.show();
    this.thirdpartyService.fetchThirdPartyById(id)
      .then((tpRef: DocumentSnapshot) => {
        const thirdparty = { id: tpRef.id, ...tpRef.data() } as Thirdparty;
        this.currentTP = thirdparty;
        this.model = thirdparty;
        this.title = thirdparty.fiscalName;
        this.spinnerService.hide();
      });
  }

  onEdit(): void {
    this.formEditMode.formState.disabled = !this.formEditMode.formState.disabled;
    this.editMode = !this.editMode;
  }

  onSubmit(): void {
    this.spinnerService.show();
    const tp = this.tpForm.value as Thirdparty;
    if (this.createMode) {
      this.thirdpartyService.addThirdparty(tp)
      .then(res => {
        this.spinnerService.hide();
        this.toastService.show('bg-success text-light', `${tp.fiscalName} creado exitosamente!`, 'Éxito!', 7000);
        this.router.navigate(['/thirdparty/list']);
      })
      .catch(err => {
        this.spinnerService.hide();
        console.error(err);
        this.toastService.show('bg-danger text-light', err, 'Error!', 7000);
      });
    }
    else {
      if (this.currentTP && this.currentTP.id) { 
        this.thirdpartyService.updateThirdparty(this.currentTP.id, tp)
        .then(res => {
          this.spinnerService.hide();
          this.toastService.show('bg-success text-light', `${this.currentTP?.fiscalName} se ha actualizado con éxito!`, 'Éxito!', 7000);
          this.router.navigate(['/thirdparty/list']);
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
    this.tpSub.unsubscribe();
    this.submitSub.unsubscribe();
  }
}


