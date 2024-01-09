import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperationService } from '../../services/operation.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { Location } from '@angular/common';
import { UserService } from 'src/app/modules/user/services/user.service';

@Component({
  selector: 'app-operation-details',
  templateUrl: './operation-details.component.html',
  styleUrl: './operation-details.component.scss'
})
export class OperationDetailsComponent implements OnInit {
  currentId: string | null = null;
  currOp: any = null;
  currentUser: any = {
    name: 'Juan',
    lastName: 'Lopez',
    role: 'partner'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private operationService: OperationService,
    private spinnerService: SpinnerService,
  ) {
  }


  ngOnInit(): void {
    this.currentId = this.route.snapshot.params['id'];
    if (this.currentId) { 
      this.spinnerService.show();
      this.operationService.fetchOperationById(this.currentId)
        .then((data: any) => {
          this.currOp = data;
          this.spinnerService.hide();
        })
        .catch((err: any) => { 
          console.log(err);
          this.spinnerService.hide();
        });
    }
  }

  partnerLookup(id: string): void {
    this.router.navigate(['../../../thirdparty/details', id], { relativeTo: this.route });
  }

  onSend(): void { 
    // Adapting object to what's expected in the send function
    const opToSend = { 
      description: this.currOp.description,
      investment: this.currOp.investment,
      make: this.currOp.make,
      model: this.currOp.model,
      id: this.currentId,
      partnerFiscalName: this.currOp.partnerFiscalName,
      partnerId: this.currOp.partnerId,
      quote: this.currOp.rent,
      reference: this.currOp.reference,
      tenor: this.currOp.tenor,
    };
    this.operationService.sendOperation(opToSend)
      .then((data: any) => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  onDuplicate(): void {
    this.operationService
    this.router.navigate(['../../'], { relativeTo: this.route });
  };

  onDelete(): void { 
    alert('Eliminar operación');
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
   
  onMessagesView(): void {
    alert('Ver mensajes');
  }

  close(): void {
    this.location.back();
  }

  // Todo: delete once deved: 
  userRoleSelect(eventTarget: any): void {
    this.currentUser.role = eventTarget.value;
  }
}
