import axios from "axios";

export const APITemplate = async (url, method, data = {}, headers = {}) => {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`;

    const config = {
      withCredentials: true, // Include credentials (cookies)
      headers: {
        ...headers,
        // caches: "no-store",
      },
    };

    let response;
    if (method === "POST") {
      response = await axios.post(apiUrl, data, config);
    } else if (method === "GET") {
      response = await axios.get(apiUrl, config);
    } else if (method === "PUT") {
      response = await axios.put(apiUrl, data, config);
    } else if (method === "DELETE") {
      response = await axios.delete(apiUrl, config);
    } else {
      throw new Error(`Unsupported method: ${method}`);
    }

    return response.data;
  } catch (error) {
    console.error("API Request Failed:", error.response || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
