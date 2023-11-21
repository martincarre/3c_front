// Basic Module imports:
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedRoutingModule } from './shared-routing.module';

// Shared Components:
import { NavbarComponent } from './components/navbar/navbar.component';

// Bootstrap imports:
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    NavbarComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    // Bootstrap imports:
    NgbDropdownModule
  ],
  exports: [
    // Shared Components:
    NavbarComponent,
    // Bootstrap exports:
    NgbDropdownModule
  ]
})
export class SharedModule { }
