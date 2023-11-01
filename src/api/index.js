import axios from "axios";

const BASE_URL = "http://localhost:5000"; // Your API base URL

// Create an instance of Axios with a base URL
const api = axios.create({
  baseURL: BASE_URL,
});

// Function to handle response and return data or throw an error
const handleResponse = (response) => {
  if (response.status === 200) {
    if ("success" in response.data && !response.data.issuccess) {
      handleApiError(response);
    }
    return response.data;
  } else {
    throw new Error(response.statusText);
  }
};

// Function to handle API errors and display a message
const handleApiError = (error, customNotification) => {
  console.log(customNotification);
  if (error.response) {
    const { status, data } = error.response;

    if (data && data.message) {
      // If the response contains a custom error message, use that
      customNotification.error({ title: data.message });
    } else {
      // Handle general HTTP status codes
      switch (status) {
        case 400:
          customNotification.error({ title: "Bad Request" });
          break;
        case 401:
          customNotification.error({ title: "You are not authorized user" });
          break;
        case 403:
          customNotification.error({ title: "You have not privillege to access this page" });
          break;
        case 404:
          customNotification.error({ title: "Not Found" });
          break;
        // Add more status code cases as needed
        default:
          customNotification.error({ title: "An error occurred" });
          break;
      }
    }

    console.error(`API error - Status: ${status}, Message: ${data.message}`);
    return data;
  } else {
    console.error("Network or server error:", error.message);
    return { message: "Network or server error" };
  }
};

// Function for making a GET request
const get = async (endpoint, customNotification, isAuth = false, authenticationData = {}) => {
  try {
    const headers = {};

    if (isAuth) {
      const { accessToken } = authenticationData; // Access the user or get the token from where it's stored

      // Include the token in the request headers
      headers.Authorization = `Bearer ${accessToken}`; // Replace 'user.token' with your actual token source
    }
    const response = await api.get(endpoint, { headers });
    return handleResponse(response);
  } catch (error) {
    console.log(error);
    return handleApiError(error, customNotification);
  }
};

// Function for making a POST request
const post = async (
  endpoint,
  data,
  customNotification,
  isAuth = false,
  authenticationData = {}
) => {
  try {
    const headers = {};

    if (isAuth) {
      const { accessToken } = authenticationData; // Access the user or get the token from where it's stored

      // Include the token in the request headers
      headers.Authorization = `Bearer ${accessToken}`; // Replace 'user.token' with your actual token source
    }
    const response = await api.post(endpoint, data, { headers });
    return handleResponse(response);
  } catch (error) {
    return handleApiError(error, customNotification);
  }
};

// You can create similar functions for other HTTP methods (PUT, DELETE, etc.)

export { get, post };
