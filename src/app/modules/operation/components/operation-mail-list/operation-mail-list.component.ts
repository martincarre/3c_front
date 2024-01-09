import { Component, Input, OnInit, inject } from '@angular/core';
import { OperationService } from '../../services/operation.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { MailService } from 'src/app/core/services/mail.service';

@Component({
  selector: 'app-operation-mail-list',
  templateUrl: './operation-mail-list.component.html',
  styleUrl: './operation-mail-list.component.scss'
})
export class OperationMailListComponent implements OnInit{
  activeModal = inject(NgbActiveModal);
  @Input() data: any;
  mails: any[] = [];

  constructor(
    private operationService: OperationService,
    private spinnerService: SpinnerService,
    private mailService: MailService,
  ) {}

  ngOnInit(): void {
    this.spinnerService.show();
    this.operationService.fetchOperationMails(this.data)
      .then(async (data: any) => {
        data.map(async (mail: any) => {
          mail.delivery = (await this.mailService.fetchMailById(mail.mailId) as any).delivery.state;
          console.log(mail.delivery);
        });
        this.mails = data;
        console.log(this.mails)
        this.spinnerService.hide();
      })
      .catch((err: any) => {
        console.log(err);
        this.spinnerService.hide();
      });
  }
}
