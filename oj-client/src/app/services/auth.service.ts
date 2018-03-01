import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import * as auth0 from 'auth0-js';
import 'rxjs/add/operator/toPromise';
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
    const accessToken = authResult.accessToken;
    const idToken = authResult.idToken;

    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('id_token', idToken);
    //
    // this.auth0.client.userInfo(accessToken, (err, profile) => {
    //   if (profile) {
    //     localStorage.setItem('profile', profile);
    //   } else if (err) {
    //     console.log(err);
    //   }
    // });
  }


  public logout(): void {
    // Remove tokens, expiry time and profile from localStorage
    localStorage.removeItem('expires_at');
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    // localStorage.removeItem('profile');

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
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        cb(profile);
      } else if (err) {
        console.log(err);
      }
    });
  }


  public resetPassword(): void {
    let name;
    this.getProfile(profile => name = profile.name);
    let url:string = `https://${this.domain}/dbconnections/change_password`;
    let body = {
      client_id: this.clientID,
      email: name,
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
