import axios from "axios";

const { BASE_URL, API_KEY } = process.env;

const getToken = () => {
  if (API_KEY) {
    return API_KEY;
  } else {
    console.error("Set an api key in .env");
  }
};

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});
