import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable()
export class  AuthGuardService implements CanActivate {

  profile:any;

  constructor(@Inject('auth') private auth, private router: Router) {
  }

  canActivate(): boolean {
    if (this.auth.isAuthenticated()) {
      return true; // 已经登录，返回true
    } else {
      // 未登录，浏览器页返回到/problems页面，并返回false
      this.router.navigate(['/problems']);
      return false;
    }
  }

  isAdmin(): boolean {
    this.auth.getProfile(profile => this.profile = profile);
    if (this.auth.isAuthenticated() && this.profile.name == "1904219831@qq.com") {
      return true;
    } else {
      return false;
    }
  }

}
