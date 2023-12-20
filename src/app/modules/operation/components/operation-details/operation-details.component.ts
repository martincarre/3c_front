import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperationService } from '../../services/operation.service';

@Component({
  selector: 'app-operation-details',
  templateUrl: './operation-details.component.html',
  styleUrl: './operation-details.component.scss'
})
export class OperationDetailsComponent implements OnInit {
  currentId: string | null = null;
  currOp: any = null;
  constructor(
    private route: ActivatedRoute,
    private operationService: OperationService
  ) {}


  ngOnInit(): void {
    this.currentId = this.route.snapshot.params['id'];
    if (this.currentId) { 
      this.operationService.fetchOperationById(this.currentId)
        .then((data: any) => {
          this.currOp = data;
        })
        .catch((err: any) => { 
          console.log(err);
        });
    }
  }

}
