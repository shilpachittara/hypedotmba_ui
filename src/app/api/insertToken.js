// /pages/api/insertToken.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { tokenAddress, creator, initialInvestment, txHash } = req.body;

    // 🧠 Call your GraphQL backend mutation
    const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `
          mutation CreateToken($tokenAddress: String!, $creator: String!, $initialInvestment: String!, $txHash: String!) {
            createToken(
              tokenAddress: $tokenAddress
              creator: $creator
              initialInvestment: $initialInvestment
              txHash: $txHash
            )
          }
        `,
        variables: {
          tokenAddress,
          creator,
          initialInvestment,
          txHash
        }
      })
    });

    const result = await response.json();
    console.log("Backend mutation result:", result);

    if (result.errors) {
      console.error(result.errors);
      return res.status(500).json({ error: "Failed to insert token" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}