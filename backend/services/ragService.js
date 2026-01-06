import axios from "axios";

export async function queryRag(payload) {
  const response = await axios.post(
    `${process.env.RAG_SERVICE_URL}/query`,
    payload,
    { timeout: 8000 }
  );

  return response.data;
}
