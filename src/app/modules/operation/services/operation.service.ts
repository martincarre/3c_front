import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, where, query, deleteDoc, doc, getDoc } from '@angular/fire/firestore';
import { PV, PMT, RATE } from '@formulajs/formulajs'
import { UserService } from '../../user/services/user.service';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { OperationConfirmationModalComponent } from '../components/operation-confirmation-modal/operation-confirmation-modal.component';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private _rate: number = 0.1;
  private _periodicity: number = 12;
  private opCollection;
  private opEmailCollection;
  // TODO Change for production
  private devBaseRoute: string = 'http://localhost:4200/operation/details/';

  constructor(
    private fs: Firestore,
    private userService: UserService,
    private authService: AuthService,
    private modalService: NgbModal,
    private spinnerService: SpinnerService,
  ) {
    this.opCollection = collection(this.fs,'operations');
    this.opEmailCollection = collection(this.fs,'operationEmails');
  }

  public getQuote(ecoDetails: any): number | Error {
    const rate = ecoDetails.rate? ecoDetails.rate : this._rate;
    const commission = ecoDetails.commission? ecoDetails.commission : 0;
    const quote = PMT(rate/this._periodicity, ecoDetails.duration, -ecoDetails.amount * ( 1 + ecoDetails.margin + commission ), ecoDetails.rv, 1);
    const markedRate = RATE(ecoDetails.duration, PMT(rate/this._periodicity, ecoDetails.duration, -1 * ( 1 + ecoDetails.margin + commission ),0, 1), -1, 0, 1, 0) * this._periodicity;
    const pv = PV(markedRate/this._periodicity, ecoDetails.duration, -ecoDetails.amount, -ecoDetails.rv, 1);
    if (ecoDetails.selector) {
      return quote;
    } else {
      return pv;
    }
  }

  public async fetchOperations(partnerId?: string, userBased?: boolean): Promise<any> {
    const constraints: any[] = [];
    if (partnerId) {
      constraints.push(where('tpType', '==', partnerId));
    }
    if (userBased) {
      // TODO
    }
    const q = query(this.opCollection, ...constraints);
    return (await getDocs(q)).docs.map(ops => {
      return { id: ops.id, ...ops.data() }
    });
  }

  public async fetchOperationById(opId: string): Promise<any> {
    const opRef = doc(this.opCollection, opId);
    return (await getDoc(opRef)).data();
  }

  public async deleteOperation(opId: string): Promise<any> {
    const tpRef = doc(this.opCollection, opId);
    return await deleteDoc(tpRef);
  }

  public async sendOperation(op: any): Promise<any> {
    const sendModalRef: NgbModalRef = this.modalService.open(OperationConfirmationModalComponent);
    sendModalRef.componentInstance.data = op;
    return sendModalRef.result
      .then(async (modalRes: any) => {
        this.spinnerService.show();

        // Checking if user exists
        const checkEmail = await Promise.all([
          this.userService.checkFSUserByEmail(modalRes.email),
          this.authService.checkAuthUserEmail(modalRes.email)
        ]);
        // if not create a new user
        let addUser = true;

        // if it exists, do nothing
        if(checkEmail[0] || checkEmail[1].data) {
          addUser = false;
        }

        // Creating user if necessary
        if (addUser) {
          this.userService.addUserByEmail(modalRes.email, modalRes.roleSelection, modalRes.partnerId, modalRes.partnerFiscalName);
        }

        // Create message object with all the required params
        delete Object.assign(modalRes, {opId: modalRes.id }).id;
        const offerLink = this.devBaseRoute + modalRes.opId;
        console.log('offerLink', offerLink);
        console.log('Base', this.devBaseRoute);
        console.log('modalRes opId', modalRes.opId);
        modalRes = { offerLink: offerLink ,...modalRes };
        console.log(modalRes);
        // Add the message to be sent to Firestore
        await addDoc(this.opEmailCollection, modalRes);
        // Upon creation, firestore will shoot an email configured as a trigger extension with Google Functions
        
        this.spinnerService.hide();
        
      })
      .catch((err: any) => {
        console.error(err);
        this.spinnerService.hide();
      });
  }
  
  public async createOperation(op: any): Promise<any> {
    console.log(op);
    return await addDoc(this.opCollection, op);
  }

}