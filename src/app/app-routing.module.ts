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
  {
    path: 'user',
    loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule)
  },
  {
    path: 'contract',
    loadChildren: () => import('./modules/contract/contract.module').then(m => m.ContractModule)
  },
  {
    path: 'file',
    loadChildren: () => import('./modules/file/file.module').then(m => m.FileModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
