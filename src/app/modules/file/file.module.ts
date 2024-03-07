import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileRoutingModule } from './file-routing.module';
import { FileComponent } from './components/file/file.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { FileListComponent } from './components/file-list/file-list.component';



@NgModule({
  declarations: [
    FileComponent,
    FileUploadComponent,
    FileListComponent
  ],
  imports: [
    CommonModule,
    FileRoutingModule
  ]
})
export class FileModule { }
