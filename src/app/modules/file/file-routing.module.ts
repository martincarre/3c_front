import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileComponent } from './components/file/file.component';
import { FileListComponent } from './components/file-list/file-list.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';

const routes: Routes = [
  {
    path: '',
    component: FileComponent,
    children: [
      { path: '', redirectTo: 'list',  pathMatch: 'full' },
      { path: 'list', component: FileListComponent },
      { path: 'upload/:id', component: FileUploadComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FileRoutingModule { }
