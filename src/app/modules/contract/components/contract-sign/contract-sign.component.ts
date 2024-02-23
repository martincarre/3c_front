import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../services/contract.service';

@Component({
  selector: 'app-contract-sign',
  templateUrl: './contract-sign.component.html',
  styleUrl: './contract-sign.component.scss'
})
export class ContractSignComponent implements OnInit{
  currContractId: string | null = null;
  SIGN_URL: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService
  ) {}

  ngOnInit(): void {
    this.currContractId = this.route.snapshot.params['id'];
    // TODO: Create the call for the contract based on the contract ID and rearrange the backend to create signature inside a contract dedicated fns? 
    if(!this.currContractId) {
      alert('Error para encontrar el id del contrato, redirigiendo...');
      this.router.navigate(['/']);
    } else {
      this.SIGN_URL = this.contractService.getContractSignUrl(this.currContractId);
    }
  }
}
