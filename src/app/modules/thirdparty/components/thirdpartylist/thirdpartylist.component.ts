import { Component, OnDestroy, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { ThirdpartyService } from '../../services/thirdparty.service';
import { Thirdparty } from '../../models/thirdparty.model';
import { Subscription, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalContent } from 'src/app/core/components/confirmation-modal/confirmation-modal.component';
import { SpinnerService } from 'src/app/core/services/spinner.service';

@Component({
  selector: 'app-thirdpartylist',
  templateUrl: './thirdpartylist.component.html',
  styleUrls: ['./thirdpartylist.component.scss']
})
export class ThirdpartylistComponent implements OnInit, OnDestroy {
  private tpSub: Subscription = new Subscription();
  
  columns: any[] = [
    { prop: 'fiscalId', name: 'NIF/CIF' }, 
    { prop: 'fiscalName', name: 'Denominación' }, 
    { prop: 'postalCode', name: 'Código Postal' },
    { prop: 'city', name: 'Ciudad' }
  ];
  tpList: any[] = [];
  columnMode = ColumnMode

  constructor(
    private tpservice: ThirdpartyService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private spinnerService: SpinnerService
  ) { }


  ngOnInit(): void {
    this.fetchData();
  }

  private fetchData(): void {
    this.spinnerService.show();
    this.tpservice.fetchThirdparties()
      .then(
        (data: Thirdparty[]) => {
          this.tpList = data.map((tp: Thirdparty) => {
                return {
                  fiscalId: tp.fiscalId,
                  fiscalName: tp.fiscalName,
                  postalCode: tp.postalCode,
                  city: tp.city,
                  actions: null,
                  id: tp.id
                }
            });
          this.spinnerService.hide();
        }
      )
      .catch((err: any) => {
        this.spinnerService.hide();
        console.error(err);
      });
  }

  viewDetails(thirdparty: Thirdparty) {
    this.router.navigate(['../details', thirdparty.id], { relativeTo: this.route });
  }

  deleteThirdparty(thirdparty: Thirdparty) {
    const confirmationData = {
      title: 'Eliminar tercero',
      message: `¿Está seguro que desea eliminar el tercero ${thirdparty.fiscalName}?`
    }
    const modalRef = this.modalService.open(ConfirmationModalContent)
    modalRef.componentInstance.data = confirmationData;
    modalRef.result 
      .then((res: any) => {
        this.spinnerService.show();
        thirdparty.id ? this.tpservice.deleteThirdparty(thirdparty.id)
          .then((delRes: any) => {
            this.spinnerService.hide();
            this.fetchData();
          })
          .catch((err: any) => {
            this.spinnerService.hide();
            console.error(err);
          })
          : console.log('No id');
    })
  }

  ngOnDestroy(): void {
    this.tpSub.unsubscribe();
  }

}