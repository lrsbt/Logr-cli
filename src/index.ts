import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import ora from "ora";
import chalk from "chalk";
import inquirer from "inquirer";
import { Command } from "commander";
import { api } from "./api";
import { readConfig, updateConfig, writeConfig } from "./config";
import { LoginResponse } from "../types";

const { BASE_URL } = process.env;

const program = new Command();

program.name("Logr").description("CLI tool for logging and viewing.");

program.command("hi").action(async () => {
  console.log(chalk.cyanBright(`Hi!`));
});

program.command("signup").action(async () => {
  const r = await axios.post(`${BASE_URL}/auth/signup`, {
    username: "dog",
    password: "w00f",
  });
  console.log(r.data);
});

program
  .command("login")
  .description("Log into Logr")
  .action(async () => {
    let spinner = ora("Authing");
    try {
      const { username, password } = await inquirer.prompt([
        { type: "input", name: "username", message: "Enter your username:" },
        { type: "password", name: "password", message: "Please enter your password:" },
      ]);
      spinner.start();
      const { data } = await axios.post<LoginResponse>(`${BASE_URL}/auth/login`, {
        username,
        password,
      });
      writeConfig({ api_key: data.user.api_key });
      spinner.succeed(`Welcome ${data.user.username}!`);
    } catch (error) {
      spinner.fail("Error loggin in!");
    }
  });

program
  .command("status")
  .description("Check the current status")
  .action(async () => {
    // read config
    // use api_key to get /me
    // if it returns things, we are good
    // if it fails then the local config is b0rked
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

program.parseAsync();
