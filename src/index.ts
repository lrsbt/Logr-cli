import dotenv from "dotenv";
import { Command } from "commander";
import axios from "axios";

dotenv.config();

const { BASE_URL, API_KEY } = process.env;

const getToken = () => {
  if (API_KEY) {
    return API_KEY;
  } else {
    console.error("Set an api key in .env");
  }
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

const program = new Command();

program.name("Logr").description("CLI tool for logging and viewing.");

program.command("signup").action(async () => {
  const r = await axios.post(`${BASE_URL}/auth/signup`, {
    username: "dog",
    password: "w00f",
  });
  console.log(r.data);
});

program.command("login").action(async () => {
  const r = await axios.post(`${BASE_URL}/auth/login`, {
    username: "dog",
    password: "w00f",
  });
  console.log(r.data);
});

program.command("projects").action(async () => {
  const r = await api.get(`${BASE_URL}/projects`);
  console.log(r.data);
});

program
  .command("project")
  .argument("id", "project id")
  .action(async (id) => {
    const r = await api.get(`${BASE_URL}/projects/${id}`);
    console.log(r.data);
  });

program
  .command("project-create")
  .argument("name", "project name")
  .action(async (name) => {
    const r = await api.post(`${BASE_URL}/projects`, { name });
    console.log(r.data);
  });

program
  .command("log")
  .argument("project", "project name")
  .argument("channel", "channel name")
  .argument("event", "event name")
  .action(async (project, channel, event) => {
    const r = await api.post(`${BASE_URL}/data`, { project, channel, event });
    console.log(r.data);
  });

program.parse();
