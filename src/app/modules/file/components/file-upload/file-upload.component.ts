import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../../services/file.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements OnInit {
  private contractId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.contractId = this.route.snapshot.paramMap.get('contractId');
    console.log(this.contractId);
    this.authService.getAuthedUser().subscribe((user) => {
      console.log(user);
    });
  }

  onFileChange(event: any): void {
    console.log(event);
  }
}
