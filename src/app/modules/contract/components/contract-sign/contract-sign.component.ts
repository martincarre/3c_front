import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { CollectionReference, Firestore, collection, doc, getDoc } from '@angular/fire/firestore';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contract-sign',
  templateUrl: './contract-sign.component.html',
  styleUrl: './contract-sign.component.scss'
})
export class ContractSignComponent implements OnInit, OnDestroy {
  private fs: Firestore = inject(Firestore);
  private contractCollection: CollectionReference;
  private currContractSub: Subscription = new Subscription();
  currContractId: string | null = null;
  currContract: any = null;
  counter: number = 5;

  SIGN_URL: any;
  @ViewChild('signContainer', { static: false }) signContainer: ElementRef | null = null;
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService,
    private renderer: Renderer2,
    private spinnerService: SpinnerService
  ) {
    this.contractCollection = collection(this.fs, 'contracts');
  }

  ngOnInit(): void {
    this.spinnerService.show();
    this.currContractId = this.route.snapshot.params['id'];
    // TODO: Create the call for the contract based on the contract ID and rearrange the backend to create signature inside a contract dedicated fns? 
    if(!this.currContractId) {
      alert('Error para encontrar el id del contrato, redirigiendo...');
      this.spinnerService.hide();
      this.router.navigate(['/']);
    } else {
      this.contractService.fetchContractById(this.currContractId);

      this.currContractSub = this.contractService.getCurrentContract().subscribe(
        (contract: any) => {
          if (contract && contract.contractId) {
            this.currContract = contract;
            if (this.currContract) {
              this.getSignUrl(contract.contractId);
            }
            this.spinnerService.hide();
            console.log('currContract', this.currContract);
          }
      });

    }
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  private createIframe(): void {
    if (this.SIGN_URL && this.signContainer) {
      const iframe = this.renderer.createElement('iframe');
      this.renderer.setAttribute(iframe, 'src', this.SIGN_URL);
      this.renderer.appendChild(this.signContainer.nativeElement, iframe);
      this.renderer.addClass(iframe, 'responsive-iframe');
    }
  }

  private getSignUrl(contractId: string): void {
    if (!this.currContract.signCreated) { 
      this.contractService.getContractSignUrl(contractId)
      .then((res: any) => {
        console.log(res);
        this.SIGN_URL = res.url;
        this.createIframe();
      })
      .catch((err: any) => {
        console.error(err.message);
      });
    }
    else {
      // No matter if it's signed or not show the signature iFrame. 
      this.SIGN_URL = this.currContract.signaturitRefs.signatureURL;
      console.log('Sign URL:', this.SIGN_URL);
      this.createIframe();
      // If the signature is completed, navigate away after 5 seconds and show a message with the countdown in the dom
      // TODO: work on the message and the countdown because they don't show up in the dom (below the iframe)
      if (this.currContract.signStatus === 'completed') {
        this.counter = 5;
        const interval = setInterval(() => {
          this.counter--;
          if (this.counter < 0) {
            clearInterval(interval);
            this.router.navigate(['/file/upload', this.currContractId]);
          }
        }, 1000);
      }
    }
  }

  private handleMessage(event: MessageEvent): void {
    if (event.data.event === 'completed' && this.currContractId) {
      // First change the contract's sign status to completed in Firestore
      this.contractService.changeSignStatusToCompleted(this.currContractId);
      // Then navigate to the file upload page with the contract ID
      this.router.navigate(['/file/upload', this.currContractId]);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleMessage.bind(this));
    this.contractService.unsubscribeCurrOperation();
    this.currContractSub.unsubscribe();
  }
}
