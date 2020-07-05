import gql from 'graphql-tag';


export const LOGIN_MUTATION = gql`
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    idToken
    user {
      email,
      firstName,
      lastName
    }
  }
}`;

export const REGISTER_MUTATION = gql`
mutation Register($firstName: String!, $lastName: String!, $email: String!, $password: String!) {
  register(firstName: $firstName, lastName: $lastName, email: $email, password: $password)
}`;

export const FIND_USER_QUERY = gql`
query FindUser {
  findUser {
    firstName,
    lastName
    email
  }
}`;