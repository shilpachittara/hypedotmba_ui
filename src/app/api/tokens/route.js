import { queryGraph, testSubgraphConnection } from "@/utils/graphql";

const GET_ALL_TOKENS = `
  query GetAllTokens($first: Int, $skip: Int) {
    tokens(
      first: $first
      skip: $skip
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      address
      name
      symbol
      description
      image
      social
      developer
      tokensSold
      createdAt
      transactions(first: 5, orderBy: timestamp, orderDirection: desc) {
        id
        amount
        isBuy
        timestamp
      }
    }
  }
`;

const TEST_QUERY = `
  {
    _meta {
      block {
        number
      }
      hasIndexingErrors
    }
    tokens(first: 5) {
      id
      name
      createdAt
    }
  }
`;

export async function GET(request) {
  try {
    // First test the connection
    console.log('Testing subgraph connection...');
    await testSubgraphConnection();
    
    console.log('Subgraph URL:', process.env.NEXT_PUBLIC_SUBGRAPH_URL);
    
    // Then fetch tokens
    const data = await queryGraph(GET_ALL_TOKENS, { 
      first: 100, 
      skip: 0 
    });
    
    console.log('Token data:', data);

    if (!data || !data.tokens) {
      throw new Error('No tokens data received from subgraph');
    }

    return Response.json({ 
      success: true, 
      data: data.tokens
    });
  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      url: process.env.NEXT_PUBLIC_SUBGRAPH_URL
    });
    
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to fetch tokens',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        url: process.env.NEXT_PUBLIC_SUBGRAPH_URL
      } : undefined
    }, { 
      status: 500 
    });
  }
} 