import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import App from './App/App';
import './styles/index.scss';

const httpLink = new HttpLink({
  uri: `https://${process.env.REACT_APP_API_ENDPOINT}/graphql`
  // uri: `http://localhost:4000/graphql`
});

const wsLink = new GraphQLWsLink(createClient({
  url: `ws://${process.env.REACT_APP_API_ENDPOINT}/graphql`,
  // url: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true
  }
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);