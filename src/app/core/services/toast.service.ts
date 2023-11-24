
import { Injectable, TemplateRef } from '@angular/core';

export interface Toast {
	// template: TemplateRef<any>;
	classname?: string;
	header?: string;
	delay?: number;
	message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
	toasts: Toast[] = [];
	// private templates: { [key: string]: TemplateRef<any> } = {};

  	// setTemplate(name: string, template: TemplateRef<any>) {
    // 	this.templates[name] = template;
  	// }

	// getTemplate(name: string): TemplateRef<any> {
	// return this.templates[name];
	// }

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
