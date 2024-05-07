import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.getAuthedUser().pipe(map(user => {
    console.log('test');
    const expectedRole = route.data['expectedRole'];
    return !!user && expectedRole.includes(user.role) ? true : router.createUrlTree(['/forbidden']);
  }));
};
