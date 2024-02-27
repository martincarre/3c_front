import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { SpinnerService } from 'src/app/core/services/spinner.service';


@Injectable({
    providedIn: 'root'
})
export class FileService {
    constructor(
        private spinnerService: SpinnerService,
        private fns: Functions,
        
    ) {}

}