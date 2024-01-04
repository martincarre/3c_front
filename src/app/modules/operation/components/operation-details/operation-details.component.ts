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
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private operationService: OperationService,
    private spinnerService: SpinnerService,
    private userService: UserService,
  ) {}


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

    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  onDuplicate(): void {
    this.operationService
    this.router.navigate(['../../'], { relativeTo: this.route });
  };

  onDelete(): void { 
    alert('Eliminar operación');
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  close(): void {
    this.location.back();
  }

  // Todo: delete once deved: 
  userRoleSelect(eventTarget: any): void {
    this.currentUser.role = eventTarget.value;
  }
}
