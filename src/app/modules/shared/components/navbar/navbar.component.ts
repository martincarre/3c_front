import { Component } from '@angular/core';

interface NavItemDropdown {
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
  navItemsDropdowns: NavItemDropdown[] = [
    {
      name: 'Terceros',
      id: 'thirdparty',
      url: '/thirdparty'
    }
  ];
}
