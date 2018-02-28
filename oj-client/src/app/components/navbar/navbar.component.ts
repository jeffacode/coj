import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  title = "COJ";
  username = "";

  constructor(@Inject('auth') private auth) {
    auth.handleAuthentication(); //  The method processes the authentication hash while your app loads.
  }

  ngOnInit() {
  }

}
