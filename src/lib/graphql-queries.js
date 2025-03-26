import { gql } from '@apollo/client';

// Query to fetch all tokens based on your schema
export const GET_ALL_TOKENS = gql`
  query GetAllTokens {
    getAllTokens {
      id
      contractAddress
      factoryAddress
      name
      symbol
      description
      imageUrl
      social
      creatorAddress
      totalSupply
      tokensSold
      dailyVolume
      marketCap
      weeklyVolume
      volumeChangePercent
      holderCount
      createdAt
      updatedAt
    }
  }
`;

// Query to fetch a single token by contract address
export const GET_TOKEN_BY_ADDRESS = gql`
  query GetToken($contractAddress: String!) {
    getToken(contractAddress: $contractAddress) {
      id
      contractAddress
      factoryAddress
      name
      symbol
      description
      imageUrl
      social
      creatorAddress
      totalSupply
      tokensSold
      dailyVolume
      marketCap
      weeklyVolume
      volumeChangePercent
      holderCount
      createdAt
      updatedAt
    }
  }
`;

// Query to fetch token holders
export const GET_TOKEN_HOLDERS = gql`
  query GetTokenHolders($contractAddress: String!, $limit: Int) {
    getTokenHolders(contractAddress: $contractAddress, limit: $limit) {
      address
      balance
      percentage
    }
  }
`;

// Simple query to test connection
export const TEST_QUERY = gql`
  query {
    __typename
  }
`;

// Get all tokens from a specific factory
export const GET_TOKENS_BY_FACTORY = gql`
  query GetTokensByFactory($factoryAddress: String!) {
    getTokensByFactory(factoryAddress: $factoryAddress) {
      id
      contractAddress
      name
      symbol
      description
      imageUrl
      creatorAddress
      totalSupply
      tokensSold
      dailyVolume
      marketCap
      weeklyVolume
      volumeChangePercent
      holderCount
      createdAt
      updatedAt
      social
      factoryAddress
    }
  }
`; 