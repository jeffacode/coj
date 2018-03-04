import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  title = "Collaborative Online Judge";
  profile: any;

  constructor(@Inject('auth') public auth) {
  }

  ngOnInit() {
    this.profile = JSON.parse(localStorage.getItem('profile'));
  }

  login() {
    this.auth.login();
  }

  logout() {
    this.auth.logout();
  }
}
