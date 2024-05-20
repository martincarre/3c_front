import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';

@Component({
  selector: 'app-backuser-email-confirmation',
  templateUrl: './backuser-email-confirmation.component.html',
  styleUrl: './backuser-email-confirmation.component.scss'
})
export class BackuserEmailConfirmationComponent implements OnInit {

  private email: string | null = null;
  verified: { success: boolean; msg: string | null} | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private toastService: ToastService,
    private spinnerService: SpinnerService,
  ) { }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email');
    if (!this.email) {
      alert('Error: No email provided');
    } else { 
      console.log('Email: ', this.email);
      this.spinnerService.show();
      this.userService.confirmBackUserMail(this.email)
        .then((res) => {
          if (res.data.success) {
            this.spinnerService.hide();
            this.toastService.show('bg-success text-light', `Usuario verificado con éxito`, 'Éxito!', 7000);
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 7000);
          } else {
            this.spinnerService.hide();
            this.toastService.show('bg-danger text-light', res.data.message, 'Error!', 7000);
          }
          this.verified = { success: res.data.success, msg: res.data.message };;
        })
        .catch((err) => {
          this.spinnerService.hide();
          this.verified = { success: false, msg: err };;
          this.toastService.show('bg-danger text-light', err, 'Error!', 7000);
        });
    }


  }

}
