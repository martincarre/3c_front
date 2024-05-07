import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appRole]',
  standalone: true
})
export class RoleDirective {
  private currentUserRole: string | null = null; // Handle null if no user is connected
  private hasView = false;
  private roles: string[] | null = null; // Can now handle null

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    this.authService.getAuthedUser().subscribe(aUser => {
      aUser ? this.currentUserRole = aUser.role : this.currentUserRole = null;
      this.updateView();
    });
  }

  @Input() set appRole(roles: string[] | null) {
    this.roles = roles;
    this.updateView(); // Update the view when the roles change
  }

  private updateView(): void {
    // If roles are null, it means no restrictions, so show the view
    if (this.roles === null) {
      this.showViewIfNeeded();
    } else if (this.roles && this.currentUserRole && this.roles.includes(this.currentUserRole)) {
      // If roles include the current user's role, show the view
      this.showViewIfNeeded();
    } else {
      // Otherwise, hide the view
      this.hideView();
    }
  }

  private showViewIfNeeded(): void {
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    }
  }

  private hideView(): void {
    if (this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
