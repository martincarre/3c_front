
import { Injectable } from '@angular/core';

export interface Toast {
	classname?: string;
	header?: string;
	delay?: number;
	message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
	toasts: Toast[] = [];

	show(classname?: string, message?: string, header?: string, delay?: number) {
		const newToast = ({ classname: classname, header, delay, message } as Toast);
		this.toasts.push(newToast);
	}

	// Todo: Change to adapt just as the show method
	remove(toast: Toast) {
		this.toasts = this.toasts.filter((t) => t !== toast);
	}

	clear() {
		this.toasts.splice(0, this.toasts.length);
	}
}
