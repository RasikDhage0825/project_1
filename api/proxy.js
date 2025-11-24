// This file is the Serverless Function running on Vercel.
// It is the ONLY place where the secret API key should be used.

export default async function handler(req, res) {
  // 1. *SECURELY GET THE API KEY*
  const GEMINI_KEY = process.env.GEMINI_API_KEY; // Reads Vercel Environment Variable
  
  // Guard clause for safety
  if (!GEMINI_KEY) {
    console.error("GEMINI_API_KEY is not set in Vercel Environment Variables.");
    return res.status(500).json({ error: "Server Configuration Error: API Key Missing." });
  }

  // Ensure method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 2. *CONSTRUCT THE EXTERNAL API URL*
  const externalApiUrl = https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}; // NOTE: Switched to a standard model name for reliability

  try {
    // 3. *FORWARD THE REQUEST*
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Note: No authorization headers are needed here, as the key is in the URL
      },
      // Vercel automatically parses the JSON body into req.body for you
      body: JSON.stringify(req.body) 
    });

    // 4. *HANDLE RESPONSE*
    // If the API call itself returns an error (like 400 or 401), pass it through
    if (!response.ok) {
       const errorData = await response.json();
       console.error("Gemini API Error:", errorData);
       return res.status(response.status).json(errorData);
    }
    
    // 5. *RETURN DATA TO YOUR CLIENT*
    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error("Error forwarding request to Gemini API:", error);
    res.status(500).json({ error: "Failed to connect to the external API." });
  }
}