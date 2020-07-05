import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { User } from './../models/user.model';
import { REGISTER_MUTATION, FIND_USER_QUERY } from './../graphql';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apollo: Apollo) { }

  register(user: User){
    return this.apollo.mutate({
      mutation: REGISTER_MUTATION,
      variables:{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password
      }
    }).subscribe();
  }

  findUser(){
    return this.apollo.query({
      query: FIND_USER_QUERY
    });
  }

  capitalizeFirstLetter(x: string) {
    return x.charAt(0).toUpperCase() + x.slice(1);
  }
}
