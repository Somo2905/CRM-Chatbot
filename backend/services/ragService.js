import axios from "axios";

export async function queryRag(payload) {
  try {
    const response = await axios.post(
      `${process.env.RAG_SERVICE_URL}/api/v1/chat`,
      payload,
      { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("RAG Service Error:", error.response?.status, error.response?.data || error.message);
    
    // If Python backend is down or returning non-JSON, return a fallback response
    if (error.response?.status === 404 || error.code === 'ECONNREFUSED' || error.message.includes('not valid JSON')) {
      console.warn("Python backend unavailable, using fallback response");
      return {
        response: "I apologize, but I'm having trouble connecting to my knowledge base right now. However, I can still help you with basic tasks. Please try again in a moment, or let me know if you need immediate assistance.",
        sources: []
      };
    }
    
    throw error;
  }
}
