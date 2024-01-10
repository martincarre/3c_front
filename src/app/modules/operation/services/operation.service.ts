import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, where, query, deleteDoc, doc, getDoc, serverTimestamp } from '@angular/fire/firestore';
import { PV, PMT, RATE } from '@formulajs/formulajs'
import { UserService } from '../../user/services/user.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { OperationConfirmationModalComponent } from '../components/operation-confirmation-modal/operation-confirmation-modal.component';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ConfirmationModalContent } from 'src/app/core/components/confirmation-modal/confirmation-modal.component';
import { OperationMailListComponent } from '../components/operation-mail-list/operation-mail-list.component';
import { MailService } from 'src/app/core/services/mail.service';

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
    private mailService: MailService,
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

  public async deleteOperation(op: any): Promise<any> {
    console.log(op);
    const confirmationData = {
      title: 'Eliminar operación',
      message: `¿Está seguro que desea eliminar el tercero ${op.reference}?`
    }
    const deleteModalRef: NgbModalRef = this.modalService.open(ConfirmationModalContent);
    deleteModalRef.componentInstance.data = confirmationData;
    return deleteModalRef.result
      .then(async () => {
        this.spinnerService.show();
        const tpRef = doc(this.opCollection, op.id);
        await deleteDoc(tpRef);
        this.spinnerService.hide();
      })
      .catch((err: any) => {
        console.error(err);
        this.spinnerService.hide();
      });
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
        modalRes = { offerLink: offerLink, sentDate: serverTimestamp(), ...modalRes };
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
    op = { creation: serverTimestamp(), ...op };
    return await addDoc(this.opCollection, op);
  }

  public async viewMails(opId: string): Promise<any> {
    const mailModalRef: NgbModalRef = this.modalService.open(OperationMailListComponent, { size: 'lg', centered: true, scrollable: true});
    mailModalRef.componentInstance.data = opId;
    return mailModalRef.result;
  }

  public async fetchOperationMails(opId: string): Promise<any> {
    // Creating a query constraints array for more future flexibility
    const constraints: any[] = [];
    constraints.push(where('opId', '==', opId));
    // Creating the query
    const q = query(this.opEmailCollection, ...constraints);
    // Fetching the opMails
    const opMailsDocs = (await getDocs(q)).docs;
    // Transforming the opMails to include the delivery status and date
    const transformedOpMailsPromises = opMailsDocs.map(async (opMail) => {
      let transformedOpMail: any = { id: opMail.id, ...opMail.data() };
      // Get the mail status by checking the mail collection
      const sysMail = await this.mailService.fetchMailById(transformedOpMail.mailId);
      const delivery = sysMail.delivery.state;
      const deliveryDate = sysMail.delivery.endTime;
      return { ...transformedOpMail, delivery, deliveryDate };
    });
    // Wait for all the promises to resolve so that the opMails are complete
    const transformedOpMails = await Promise.all(transformedOpMailsPromises);

    // Sort the transformed opMails by deliveryDate (most recent first)
    transformedOpMails.sort((a, b) => {
      const aSeconds = a.deliveryDate.seconds;
      const bSeconds = b.deliveryDate.seconds;
      const aNanoseconds = a.deliveryDate.nanoseconds;
      const bNanoseconds = b.deliveryDate.nanoseconds;

      // Compare seconds first
      if (aSeconds !== bSeconds) {
        return bSeconds - aSeconds;
      }
      // If seconds are equal, compare nanoseconds
      return bNanoseconds - aNanoseconds;
    });

    return transformedOpMails;
  }

}