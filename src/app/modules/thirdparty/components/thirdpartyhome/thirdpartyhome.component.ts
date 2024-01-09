import { Component } from '@angular/core';

@Component({
  selector: 'app-thirdpartyhome',
  templateUrl: './thirdpartyhome.component.html',
  styleUrls: ['./thirdpartyhome.component.scss']
})
export class ThirdpartyhomeComponent {

  navButtons = [
    {
      name: 'Listado',
      route: '/thirdparty/list',
      icon: 'bi-houses-fill'
    },
    {
      name: 'Nuevo tercero',
      route: '/thirdparty/create',
      icon: 'bi-house-add-fill'
    },
  ];

  title = 'Third Party';
}
