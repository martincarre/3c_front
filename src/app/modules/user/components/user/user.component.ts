import { Component } from '@angular/core';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  navButtons = [
    {
      name: 'Lista usuarios',
      route: '/user/list',
      icon: 'bi-people-fill'
    },
    {
      name: 'Nuevo usuario',
      route: '/user/details/create',
      icon: 'bi-person-fill-add'
    },
  ];

  title = 'Usuarios';
}
