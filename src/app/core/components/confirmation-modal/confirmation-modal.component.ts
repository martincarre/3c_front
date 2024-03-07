import { Component, Input, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal  } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalContent {
  
  confirmationForm: FormGroup = new FormGroup({
    confirmationInput: new FormControl('', [
      Validators.required,
      Validators.pattern('borrar')
    ])
  });
	activeModal = inject(NgbActiveModal);
	@Input() data: any;
	constructor() { }


}
