// Basic Module imports:
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Shared Components:
import { NavbarComponent } from './components/navbar/navbar.component';

// Bootstrap imports:
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { SidenavComponent } from './components/sidenav/sidenav.component';



@NgModule({
  declarations: [
    NavbarComponent,
    SidenavComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    // Bootstrap imports:
    NgbDropdownModule
  ],
  exports: [
    // Shared Components:
    NavbarComponent,
    // Bootstrap exports:
    NgbDropdownModule,
    // Components: 
    SidenavComponent,
  ]
})
export class SharedModule { }
