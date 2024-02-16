import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { SignInModalComponent } from '../sign-in-modal/sign-in-modal.component';

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
export class NavbarComponent implements OnInit {
  private authStateSub: Subscription = new Subscription();
  isAuthed: boolean = false;
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

  constructor(
    private authService: AuthService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.authStateSub = this.authService.getAuthState().subscribe((authState) => {
      if (authState) {
        this.isAuthed = true;
      } else {
        this.isAuthed = false;
      }
    });
  };

  signIn() {
    this.modalService.open(SignInModalComponent);
  }

  logout() {
    this.authService.signOut();
  }
}
