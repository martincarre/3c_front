import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-global',
  templateUrl: './toast-global.component.html',
  styleUrls: []
})
export class ToastGlobalComponent {
  @ViewChild('standardTpl') standardTpl: TemplateRef<any> | undefined;
  @ViewChild('successTpl') successTpl: TemplateRef<any> | undefined;
  @ViewChild('dangerTpl') dangerTpl: TemplateRef<any> | undefined;
  
  constructor(private toastService: ToastService) {}

}
