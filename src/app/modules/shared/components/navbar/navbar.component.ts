import { Component } from '@angular/core';

interface NavItem {
  name: string;
  ico?: string;
  id: string;
  url: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  navItems: NavItem[] = [
    {
      name: 'Terceros',
      id: 'thirdparty',
      url: '/thirdparty'
    },
    {
      name: 'Operaciones',
      id: 'operation',
      url: '/operation'
    },
    {
      name: 'Usuarios',
      id: 'user',
      url: '/user'
    },
  ];
}
