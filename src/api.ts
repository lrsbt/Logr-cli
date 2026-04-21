import fs from "fs";
import axios from "axios";
import { configPath } from "./config";

const { BASE_URL } = process.env;

const getToken = () => {
  try {
    const data = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(data);
    return config.api_key ?? null;
  } catch {
    return null;
  }
};

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});
