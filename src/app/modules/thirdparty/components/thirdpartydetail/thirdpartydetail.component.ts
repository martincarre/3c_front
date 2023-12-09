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
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.fields = thirdpartyFormlyForm;
   }

  ngOnInit(): void {
    this.currentId = this.route.snapshot.params['id'];
    if (this.currentId) {
      this.createMode = false;
      this.formEditMode.formState.disabled = true;
      this.fetchThirdParty(this.currentId);
    }
  }

  tpLookUp(): void {
    const fiscalId = this.tpForm.get('fiscalId')?.value;
    if (fiscalId) {
      this.extInfoService.getTpInfo(fiscalId).subscribe((tpInfo: any) => {
        console.log(tpInfo);
      });
    }
  }

  private fetchThirdParty(id: string): void {
    this.tpSub = this.thirdpartyService.fetchThirdPartyById(id)
      .subscribe((thirdparty: Thirdparty) => {
        this.currentTP = thirdparty;
        this.model = thirdparty;
        this.title = thirdparty.fiscalName;
      });
  }

  onEdit(): void {
    this.formEditMode.formState.disabled = !this.formEditMode.formState.disabled;
    this.editMode = !this.editMode;
  }

  onSubmit(): void {
    const tp = this.tpForm.value as Thirdparty;
    if (this.createMode) {
      this.submitSub = this.thirdpartyService.addThirdparty(tp)
      .subscribe(res => {
        this.toastService.show('bg-success text-light', res.message, 'Succcess!', 7000);
        console.log(res);
        this.router.navigate(['/thirdparty/list']);
      });
    }
    else {
      this.submitSub = this.thirdpartyService.updateThirdparty(tp)
      .subscribe(res => {
        this.toastService.show('bg-success text-light', res.message, 'Succcess!', 7000);
        console.log(res);
        this.router.navigate(['/thirdparty/list']);
      });
    }
  }

  onClose(): void {
    this.router.navigate(['/thirdparty']);
  }

  ngOnDestroy(): void {
    this.tpSub.unsubscribe();
    this.submitSub.unsubscribe();
  }
}
