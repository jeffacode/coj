import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  title = "Collaborative Online Judge";
  profile: any;

  constructor(@Inject('auth') private auth) {
  }

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.auth.getProfile(profile => this.profile = profile);
    }
  }

  login() {
    this.auth.login();
  }

  logout() {
    this.auth.logout();
  }
}
