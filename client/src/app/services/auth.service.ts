import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { User } from './../models/user.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { LOGIN_MUTATION } from './../graphql';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<User>;
  private currentUser: Observable<User>;
  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private loggedOut: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(private apollo: Apollo, private router: Router, private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
    if (localStorage.getItem('currentUser') != null) {
      this.loggedIn.next(true);
      this.loggedOut.next(false);
    }
  }

  login(email: string, password: string) {
    return this.apollo.mutate({
      mutation: LOGIN_MUTATION,
      variables: {
        email: email,
        password: password
      }
    }).subscribe((result)=>{
      const token = JSON.parse(JSON.stringify(result.data));
      if(token.login.idToken && token.login.user){
        localStorage.setItem('currentUser', JSON.stringify(token.login.user.email));
          localStorage.setItem('id_token', JSON.stringify(token.login.idToken)); 
          this.currentUserSubject.next(token.login.user);
          this.loggedIn.next(true);
          this.loggedOut.next(false);
      }else{
        return false;
      }
      return true;
    });
  }
  refresh(){
    return this.http.get(`http://localhost:3000/api/refresh_token`)
      .subscribe((result)=>{
        const data = JSON.parse(JSON.stringify(result));
        if(data.idToken){
          localStorage.setItem('id_token', JSON.stringify(data.idToken));
        }else return false;
      });
  }
  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('id_token');
    this.loggedIn.next(false);
    this.loggedOut.next(true);
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }
  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }
  get isLoggedOut() {
    return this.loggedOut.asObservable();
  }
}
