import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';

const uri = 'http://localhost:3000/graphql'; // <-- add the URL of the GraphQL server here

export function createApollo(httpLink: HttpLink) {
  const authLink = new ApolloLink((operation, forward) => {

    const idToken = localStorage.getItem('id_token');
    const token = idToken?.slice(1, -1);
    operation.setContext({
      headers: {
        'Authorization': 'Bearer ' + (token ? token : '')
      }
    });

    return forward(operation);
  });

  return {
    link: ApolloLink.from([authLink.concat(httpLink.create({ uri }))]),
    cache: new InMemoryCache(),
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule { }
