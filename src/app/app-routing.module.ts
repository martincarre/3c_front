import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'thirdparty',
    loadChildren: () => import('./modules/thirdparty/thirdparty.module').then(m => m.ThirdpartyModule)
  },
  {
    path: 'operation',
    loadChildren: () => import('./modules/operation/operation.module').then(m => m.OperationModule)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
