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
  roles: string[] | null;
}

interface AUserDisplay { 
  roleDisplay: {
    name: string;
    ico: string;
  };
  displayName: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  private authStateSub: Subscription = new Subscription();
  isAuthed: boolean = false;
  
  currAuthUserDisplay: AUserDisplay | null = null;
  navItems: NavItem[] = [
    {
      name: 'Terceros',
      id: 'thirdparty',
      url: '/thirdparty',
      roles: ['admin']
    },
    {
      name: 'Operaciones',
      id: 'operation',
      url: '/operation',
      roles: ['admin', 'partner', 'moderator']
    },
    {
      name: 'Usuarios',
      id: 'user',
      url: '/user',
      roles: ['admin', 'moderator']
    },
    {
      name: 'Contratos',
      id: 'contract',
      url: '/contract',
      roles: null
    },
  ];

  constructor(
    private authService: AuthService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.authStateSub = this.authService.getAuthState().subscribe((authState) => {
      if (authState) {
        this.currAuthUserDisplay = this.aUserDisplay(authState.displayName, Object.keys(JSON.parse(authState.reloadUserInfo.customAttributes))[0]);
        this.isAuthed = true;
      } else {
        this.isAuthed = false;
      }
    });
    
  };

  aUserDisplay(displayName: string, aUserRole: string): AUserDisplay {
    return {
      displayName: displayName,
      roleDisplay: this.roleDisplay(aUserRole)
    };
  };

  roleDisplay(role: string): {name: string; ico: string;} {
    switch (role) {
      case 'admin':
        return {
          name: 'Administrador',
          ico: 'bi-shield-lock-fill'
        };
      case 'partner':
        return {
          name: 'Socio',
          ico: 'bi-shop'
        };
      case 'customer':
        return {
          name: 'Cliente',
          ico: 'bi-person-fill'
        };
        case 'moderator':
          return {
            name: 'Backoffice',
            ico: 'bi-person-badge-fill'
          };
      default:
        return {
          name: 'Usuario',
          ico: 'bi-person-fill'
        };
    }
  }

  signIn() {
    this.modalService.open(SignInModalComponent);
  }

  logout() {
    this.authService.signOut();
  }
}
