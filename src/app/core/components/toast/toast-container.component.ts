import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
	selector: 'app-toasts',
	template: `
		@for (toast of toastService.toasts; track toast) {
			<ngb-toast
				[class]="toast.classname"
				[autohide]="true"
				[delay]="toast.delay || 5000"
				[header]="toast.header || 'Mensaje del sistema'"
				(hidden)="toastService.remove(toast)"
			>
			{{ toast.message }}
		</ngb-toast>
		}
	`,
	host: { class: 'toast-container position-fixed top-2 end-0 p-3', style: 'z-index: 1200' },
})
export class ToastsContainer {
	toastService = inject(ToastService);
}
