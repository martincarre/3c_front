import { Component } from '@angular/core';

@Component({
  selector: 'app-operation-dashboard',
  templateUrl: './operation-dashboard.component.html',
  styleUrl: './operation-dashboard.component.scss'
})
export class OperationDashboardComponent {
  navButtons = [
    {
      name: 'Operaciones',
      route: '/operation/list',
      icon: 'bi-cart-fill'
    },
    {
      name: 'Crear',
      route: '/operation/create',
      icon: 'bi-cart-plus-fill'
    },
  ];

  title = 'Operaciones';
}
