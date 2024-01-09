import { Component, Input } from '@angular/core';


interface NavButton {
  name: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  @Input() navButtons: NavButton[] | undefined;

}
