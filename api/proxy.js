// This file is the Serverless Function running on Vercel.
// It acts as a secure intermediary for calling the Gemini API.

export default async function handler(req, res) {
  // --- CORS FIX ---
  // Vercel functions run on a different domain than your frontend,
  // so we must include these headers to allow the browser to accept the response.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle pre-flight CORS requests (browser checks)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed. This function only accepts POST requests." });
  }

  // 1. *SECURELY GET THE API KEY*
  // IMPORTANT: Ensure 'GEMINI_API_KEY' EXACTLY matches the name in your Vercel Environment Variables.
  const GEMINI_KEY = process.env.GEMINI_API_KEY; 
  
  if (!GEMINI_KEY) {
    console.error("GEMINI_API_KEY is not set in Vercel Environment Variables.");
    return res.status(500).json({ error: "Server Configuration Error: API Key Missing." });
  }

  // 2. *CONSTRUCT THE EXTERNAL API URL*
  // We use the simpler gemini-2.5-flash model for reliability and speed.
  const externalApiUrl = https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY};

  try {
    // 3. *FORWARD THE REQUEST to the Gemini API*
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // Vercel automatically parses the JSON body into req.body
      body: JSON.stringify(req.body) 
    });

    // 4. *HANDLE RESPONSE ERRORS FROM GEMINI API*
    if (!response.ok) {
       const errorData = await response.json();
       console.error("Gemini API Error Response:", errorData);
       // Pass the original error status and data back to the client
       return res.status(response.status).json(errorData);
    }
    
    // 5. *RETURN SUCCESSFUL DATA TO YOUR CLIENT*
    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error("Error forwarding request to Gemini API:", error);
    // Return a generic server error if the fetch call fails entirely
    res.status(500).json({ error: "Failed to connect to the external API or unexpected proxy error." });
  }
}