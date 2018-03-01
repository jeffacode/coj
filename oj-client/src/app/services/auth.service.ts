import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import 'rxjs/add/operator/filter';
import * as auth0 from 'auth0-js';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable()
export class AuthService {

  clientID = 'wkKQE0SO-9mDmdKQjg_ZavyCnHjbnfrr';
  domain =  'jeffacode.auth0.com';

  auth0 = new auth0.WebAuth({
    clientID: this.clientID,
    domain: this.domain,
    responseType: 'token id_token',
    audience: `https://${this.domain}/userinfo`,
    redirectUri: 'http://localhost:3000',
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
  private setSession(authResult): void {
    // Set the time that the Access Token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  // removes the user's tokens and
  // expiry time from browser storage.
  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // Go back to the home route
    this.router.navigate(['/']);
  }

  // checks whether the expiry time for
  // the user's Access Token has passed.
  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // Access Token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  // make a call for the user's information
  userProfile: any;

  public getProfile(cb): void {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Access Token must exist to fetch profile');
    }

    const self = this;
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        self.userProfile = profile;
      }
      cb(err, profile);
    });
  }

  // reset password
  profile: any;

  resetPassword(): void {
    this.getProfile((err, profile) => this.profile = profile);
    let url:string = `https://${this.domain}/dbconnections/change_password`;
    let body = {
      client_id: this.clientID,
      email: this.profile.name,
      connection: 'Username-Password-Authentication'
    };

    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.http.post(url, body, {headers})
      .toPromise()
      .then((res: any) => {
        console.log(res);
      })
      .catch(this.handleError);

  }

  // error handler
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purpises only
    return Promise.reject(error.body || error);
  }


}
