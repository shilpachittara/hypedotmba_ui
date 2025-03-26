import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Get the API URL from environment variables with a fallback
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/graphql';

console.log("Using GraphQL endpoint:", API_URL);

// Log any GraphQL errors or network errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

// Create an HTTP link to your GraphQL server
const httpLink = new HttpLink({
  uri: API_URL,
  // You can add headers here if needed
  // headers: { ... }
});

// Create the Apollo Client instance
const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});

export default apolloClient; 