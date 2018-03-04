import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profile: any;

  constructor(@Inject('auth') public auth) { }

  ngOnInit() {
    this.profile = JSON.parse(localStorage.getItem('profile'));
  }

  resetPassword() {
    this.auth.resetPassword();
  }

}
