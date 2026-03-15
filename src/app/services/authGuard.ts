import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class AuthRoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole = route.data['role'];
    
    const userInfo = this.authService.user(); 

    if (!userInfo || userInfo.role !== expectedRole) {
      console.warn('Access Denied: Role mismatch or not logged in');
      this.router.navigate(['/']); 
      return false;
    }

    return true; 
  }
}