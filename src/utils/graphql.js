const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/105140/test/v0.0.3';

export async function queryGraph(query, variables = {}) {
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      }),
      next: { revalidate: 10 } // Cache for 10 seconds
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL Errors:', data.errors);
      throw new Error(data.errors[0].message);
    }
    
    return data.data;
  } catch (error) {
    console.error('GraphQL query error:', {
      error,
      query,
      variables,
      url: SUBGRAPH_URL
    });
    throw new Error(error.message || 'Failed to fetch data from subgraph');
  }
}

// Test query function
export async function testSubgraphConnection() {
  const TEST_QUERY = `
    {
      _meta {
        block {
          number
        }
        deployment
        hasIndexingErrors
      }
    }
  `;

  try {
    const data = await queryGraph(TEST_QUERY);
    console.log('Subgraph connection test:', data);
    return data;
  } catch (error) {
    console.error('Subgraph connection test failed:', error);
    throw error;
  }
} 