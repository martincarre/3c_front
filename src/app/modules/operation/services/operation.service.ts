import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, where, query, deleteDoc, doc, getDoc, serverTimestamp, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { PV, PMT, RATE } from '@formulajs/formulajs'
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { OperationConfirmationModalComponent } from '../components/operation-confirmation-modal/operation-confirmation-modal.component';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { ConfirmationModalContent } from 'src/app/core/components/confirmation-modal/confirmation-modal.component';
import { BehaviorSubject, Observable, Subscription, throwError } from 'rxjs';
import { MailService } from '../../shared/services/mail.service';
import { UserService } from '../../user/services/user.service';
import { ContactService } from '../../user/services/contact.service';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private _rate: number = 0.1;
  private _periodicity: number = 12;
  private opCollection;
  private opEmailCollection;

  private currOperation: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private currOperationSub$: any;
  // TODO Change for production
  private devBaseRoute: string = 'http://localhost:4200/operation/details/';

  constructor(
    private fs: Firestore,
    private modalService: NgbModal,
    private mailService: MailService,
    private spinnerService: SpinnerService,
    private contactService: ContactService,
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

  public async fetchOperationById(opId: string) {
    const opRef = doc(this.opCollection, opId);
    this.currOperationSub$ = onSnapshot(opRef, (doc) => {
      if (doc.exists()) {
        this.currOperation.next(doc.data());
        return;
      } else {
        // doc.data() will be undefined in this case
        console.log('No such document!');
        this.currOperation.next(null);
        return null;
      }
    });
  }

  public getCurrOperation(): BehaviorSubject<any> {
    return this.currOperation;
  };

  public async unsubscribeCurrOperation(): Promise<any> {
    return await this.currOperationSub$();
  };

  public async deleteOperationModal(op: any): Promise<any> {
    const confirmationData = {
      title: 'Eliminar operación',
      message: `¿Está seguro que desea eliminar el tercero ${op.reference}?`
    }
    const deleteModalRef: NgbModalRef = this.modalService.open(ConfirmationModalContent);
    deleteModalRef.componentInstance.data = confirmationData;
    return deleteModalRef.result;
  }

  public async deleteOperationById(opId: string): Promise<any> {
    try {
      this.spinnerService.show();
      const opRef = doc(this.opCollection, opId);
      await deleteDoc(opRef);
      this.spinnerService.hide();
    }
    catch (err) {
      console.error('Error deleting operation');
      this.spinnerService.hide();
      return throwError(() => new Error(`Error deleting operation: ${err}`));
    }
  }

  public async sendOperation(op: any, triggeredFrom: string): Promise<any> {
    const sendModalRef: NgbModalRef = this.modalService.open(OperationConfirmationModalComponent, { size: 'lg', centered: true});
    sendModalRef.componentInstance.data = op;
    return sendModalRef.result
      .then(async (modalRes: any) => {
        this.spinnerService.show();

        
        // if not create a new Contact
        let addContact = true;

        // Checking if Contact exists and adapting whether to create a new contact or not
        await this.contactService.checkContactByEmail(modalRes.email)
        .then((res: any) => {
          console.log('Contact exists?', res);
          addContact = res.success? false : true;
        })
        

        // Creating user if necessary
        if (addContact) {
          this.contactService.addContactByEmail(modalRes.email, modalRes.roleSelection, modalRes.partnerId, modalRes.partnerFiscalName);
        }

        // Create message object with all the required params
        const offerLink = this.devBaseRoute + modalRes.opId;
        modalRes = { offerLink: offerLink, sentDate: serverTimestamp(), ...modalRes };
        if (!modalRes.message) {
          modalRes.message = null;
        }
        // Add the message to be sent to Firestore
        await addDoc(this.opEmailCollection, modalRes)
        // Upon creation, shoot the email
        .then(async (docRef) => {
          const mailId = docRef.id;
          await this.mailService.sendOperationEmail(mailId)
          .then((res: any) => {
            console.log('Email sent!', res);
            if (res.success) {
              this.fetchOperationMails(modalRes.opId);
            }
            this.spinnerService.hide();
          })
          .catch((err: any) => {
            console.error('Error sending email', err);
            this.spinnerService.hide();
          });
        })
        .catch((err: any) => {
          console.error('Error adding opEmail to Firestore');
          this.spinnerService.hide();
        });
        
        // Need to work on redirection depending on whether the modal was "dismissed" or not.
        if (triggeredFrom === 'details') {
          return {redirect: true}
        } else {
          return {redirect: false}
        }
      })
      .catch((err: any) => {
        console.log('Modal dismissed', err);
        this.spinnerService.hide();
      });
  }
  
  public async createOperation(op: any): Promise<any> {
    op = { creation: serverTimestamp(), ...op };
    return await addDoc(this.opCollection, op);
  }

  public async updateOperation(op: any): Promise<any> {
    const opRef = doc(this.opCollection, op.id);
    return await updateDoc(opRef, { ...op, latestUpdate: serverTimestamp()});
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
      if (transformedOpMail.mailId) {
        const delivery = transformedOpMail.deliveryStatus;
        const deliveryDate = transformedOpMail.deliveryDate;
        return { ...transformedOpMail, delivery, deliveryDate };
      } else { 
        // If the mail in the mail collection hasn't been created yet, return a pending status with current server time. Just for presentation purposes.
        return { ...transformedOpMail, delivery: 'PENDING', deliveryDate: serverTimestamp() };
      }
    });
    // Wait for all the promises to resolve so that the opMails are complete
    const transformedOpMails = await Promise.all(transformedOpMailsPromises);

    // Filter out the null and undefined opMails
    const filteredOpMails = transformedOpMails.filter(mail => mail !== null && mail !== undefined);

    // Sort the transformed opMails by deliveryDate (most recent first)
    const sortedAndFilteredOpMails = filteredOpMails.sort((a, b) => {
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
    // Return the sorted and filtered opMails with all the required data
    return sortedAndFilteredOpMails;
  }

}