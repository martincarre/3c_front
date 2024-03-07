import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sign-selector-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sign-selector-modal.component.html',
  styleUrl: './sign-selector-modal.component.scss'
})
export class SignSelectorModalComponent {
  activeModal = inject(NgbActiveModal);
  
  close() {
    this.activeModal.dismiss();
  };

  goToSignIn() {
    this.activeModal.close(false);
  };

  gotToSignUp() {
    this.activeModal.close(true);
  };
}
