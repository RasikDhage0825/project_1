// This file is the Serverless Function running on Vercel.
// It is the ONLY place where the secret API key should be used.

export default async function handler(req, res) {
  // 1. **SECURELY GET THE API KEY**
  // IMPORTANT: Change 'GEMINI_API_KEY' to the exact name you set in Vercel's settings.
  const GEMINI_KEY = process.env.GEMINI_API_KEY; // Reads Vercel Environment Variable
  
  // Guard clause for safety
  if (!GEMINI_KEY) {
    console.error("GEMINI_API_KEY is not set in Vercel Environment Variables.");
    return res.status(500).json({ error: "Server Configuration Error: API Key Missing." });
  }

  // 2. **CONSTRUCT THE EXTERNAL API URL**
  // The secret key is added here, on the server, as a query parameter.
  const externalApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_KEY}`;

  try {
    // 3. **FORWARD THE REQUEST**
    // The req.body contains the prompt and system instruction sent from your Project.html.
    const response = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // Send the body received from the client directly to the Gemini API
      body: JSON.stringify(req.body) 
    });

    // 4. **HANDLE RESPONSE**
    // Get the response data and status from the Gemini API
    const data = await response.json();
    
    // 5. **RETURN DATA TO YOUR CLIENT (Project.html)**
    // The status and data are passed back to the user's browser.
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error("Error forwarding request to Gemini API:", error);
    res.status(500).json({ error: "Failed to connect to the external API." });
  }
}