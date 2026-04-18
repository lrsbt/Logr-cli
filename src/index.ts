import "dotenv/config";
import { Command } from "commander";
import axios from "axios";

const { BASE_URL } = process.env;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    // Authorization: `Bearer ${getToken()}`,
  },
});

const program = new Command();

program
  .name("Logr terminal client")
  .description("CLI tool for logging and viewing.");

program.command("list").action(async (argName) => {
  console.log("Hi");
});

program.parse();
