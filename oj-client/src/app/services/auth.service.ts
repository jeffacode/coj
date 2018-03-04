import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import * as auth0 from 'auth0-js';
import 'rxjs/add/operator/toPromise';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable()
export class AuthService {

  auth0 = new auth0.WebAuth({
    clientID: 'wkKQE0SO-9mDmdKQjg_ZavyCnHjbnfrr',
    domain: 'jeffacode.auth0.com',
    responseType: 'token id_token',
    audience: 'https://jeffacode.auth0.com/userinfo',
    redirectUri: 'http://localhost:3000/callback',
    scope: 'openid profile' // to retrieve user information
  });

  constructor(public router: Router, public http: HttpClient) {
  }

  public login(): void {
    this.auth0.authorize();
  }

  // looks for the result of authentication in the URL hash. Then,
  // the result is processed with the parseHash method from auth0.js.
  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.router.navigate(['/home']);
      } else if (err) {
        this.router.navigate(['/home']);
        console.log(err);
      }
    });
  }

  // stores the user's Access Token, ID Token, and
  // the Access Token's expiry time in browser storage.
  userProfile: any;
  private setSession(authResult): void {
    // Set the time that the Access Token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    this.getProfile((err, profile) => {
      localStorage.setItem('profile', JSON.stringify(profile));
    });
  }


  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('profile');
    // Go back to the home route
    this.router.navigate(['/']);
  }


  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // Access Token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  // make a call for the user's information

  public getProfile(cb): void {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Access Token must exist to fetch profile');
    }
    this.auth0.client.userInfo(accessToken, (err, profile) => { // userInfo是异步的
      cb(err, profile);
    });
  }

  public resetPassword(): void {
    this.getProfile((err, profile) => {
      let url:string = `https://jeffacode.auth0.com/dbconnections/change_password`;
      let body = {
        client_id: 'wkKQE0SO-9mDmdKQjg_ZavyCnHjbnfrr',
        email: profile.name,
        connection: 'Username-Password-Authentication'
      };
      let headers = new HttpHeaders().set('Content-Type', 'application/json');

      this.http.post(url, body, {headers})
        .toPromise()
        .then((res: any) => {
          console.log(res);
        })
        .catch(this.handleError);
    });
  }

  // error handler
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purpises only
    return Promise.reject(error.body || error);
  }


}
