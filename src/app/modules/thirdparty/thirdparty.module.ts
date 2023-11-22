import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThirdpartyRoutingModule } from './thirdparty-routing.module';
import { ThirdpartydetailComponent } from './components/thirdpartydetail/thirdpartydetail.component';
import { ThirdpartyhomeComponent } from './components/thirdpartyhome/thirdpartyhome.component';
import { SharedModule } from '../shared/shared.module';
import { ThirdpartylistComponent } from './components/thirdpartylist/thirdpartylist.component';



@NgModule({
  declarations: [
    ThirdpartydetailComponent,
    ThirdpartyhomeComponent,
    ThirdpartylistComponent
  ],
  imports: [
    CommonModule,
    ThirdpartyRoutingModule,
    SharedModule,
  ]
})
export class ThirdpartyModule { }
