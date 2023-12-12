import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThirdpartyRoutingModule } from './thirdparty-routing.module';
import { ThirdpartydetailComponent } from './components/thirdpartydetail/thirdpartydetail.component';
import { ThirdpartyhomeComponent } from './components/thirdpartyhome/thirdpartyhome.component';
import { SharedModule } from '../shared/shared.module';
import { ThirdpartylistComponent } from './components/thirdpartylist/thirdpartylist.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';



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
    NgxDatatableModule.forRoot({
      messages: {
        emptyMessage: 'No data to display', // Message to show when array is presented, but contains no values
        totalMessage: 'total', // Footer total message
        selectedMessage: 'selected' // Footer selected message
      }
    })
  ]
})
export class ThirdpartyModule { }
