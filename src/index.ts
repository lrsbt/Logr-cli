import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import ora from "ora";
import chalk from "chalk";
import table from "cli-table3";
import inquirer from "inquirer";
import { Command } from "commander";

import { api } from "./api";
import { readConfig, updateConfig, writeConfig } from "./config";
import {
  CreateLogResponse,
  CreateProjectResponse,
  Log,
  LoginResponse,
  ProjectsResponse,
} from "../types";

const { BASE_URL } = process.env;

const tableStyle = { chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" } };

const program = new Command();

const ensureLogin = async () => {
  const config = await readConfig();
  if (!config?.api_key) {
    program.error(`Please log in first via "logr login"`);
  }
};

program.name("Logr").description("CLI tool for logging and viewing.");

program.option("-f, --foo", "enable some foo");
program.addHelpText("beforeAll", "Test");

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
    let spinner;

    try {
      const { username, password } = await inquirer.prompt([
        { type: "input", name: "username", message: "Enter your username:" },
        { type: "password", name: "password", message: "Please enter your password:" },
      ]);

      spinner = ora("Authenticating...").start();

      const {
        data: { user },
      } = await api.post<LoginResponse>("/auth/login", {
        username,
        password,
      });

      await writeConfig({ api_key: user.api_key });
      spinner.succeed(`Welcome ${user.username}! You are now logged in.`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        spinner?.fail(error.response?.data?.message || "Error logging in!");
      } else {
        spinner?.fail("Error logging in!");
      }
    } finally {
      spinner?.stop();
    }
  });

program
  .command("logout")
  .description("Log out of Logr")
  .action(async () => {
    let spinner;
    try {
      spinner = ora("Logging out...").start();
      await api.post(`/auth/logout`);
      await writeConfig({});
      spinner.succeed(`Successfully logged out.`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        spinner?.fail(error.response?.data?.message || "Error logging out!");
      } else {
        spinner?.fail("Error logging out!");
      }
    } finally {
      spinner?.stop();
    }
  });

program
  .command("status")
  .description("Check the current status")
  .action(async () => {
    let spinner;
    try {
      spinner = ora().start();
      const {
        data: { user },
      } = await api.get<LoginResponse>("/auth/me");
      spinner.succeed(`You are logged in as ${user.username}.`);
    } catch (error: any) {
      if (error.status === 403) {
        spinner?.succeed("Not logged in.");
      } else {
        spinner?.fail("Error getting status!");
      }
    } finally {
      spinner?.stop();
    }
  });

program
  .command("projects")
  .hook("preAction", async () => await ensureLogin())
  .action(async () => {
    let spinner;
    try {
      spinner = ora().start();
      const config = await readConfig();
      if (!config?.api_key) spinner?.fail("Please log in via `logr login`");

      const { data } = await api.get<ProjectsResponse>("/projects");
      spinner.succeed("Projects:");

      // Create Table Output
      const tableContent = data.map((d) => [d.name, d.created_at]);
      var t = new table({ head: ["Name", "Created"], ...tableStyle });
      t.push(...tableContent);
      console.log(t.toString());

      console.log('Project info via "logr project <name>"');
    } catch (error: any) {
      spinner?.fail("Error getting projects.");
    } finally {
      spinner?.stop();
    }
  });

program
  .command("project")
  .argument("name", "project name")
  .hook("preAction", async () => await ensureLogin())
  .action(async (name) => {
    let spinner;
    try {
      spinner = ora().start();
      const config = await readConfig();
      if (!config?.api_key) spinner?.fail("Please log in via `logr login`");

      const { data } = await api.get<Log[]>(`/projects/${name}`);
      spinner.stop();

      // Create Table Output
      const tableContent = data.map((d, i) => [i + 1, d.channel, d.event, d.created_at]);
      var t = new table({ head: ["", "Channel", "Event", "Created at"], ...tableStyle });
      t.push(...tableContent);
      console.log(t.toString());

      // TODO: Also show project attached
    } catch (error: any) {
      if (error.status === 403) {
        spinner?.fail(`Project "${name}" doesn't exist.`);
      } else {
        spinner?.fail("Error getting project.");
      }
    } finally {
      spinner?.stop();
    }
  });

program
  .command("project-create")
  .argument("name", "project name")
  .hook("preAction", async () => await ensureLogin())
  .action(async (name) => {
    let spinner;
    try {
      spinner = ora().start();
      const { data } = await api.post<CreateProjectResponse>(`/projects`, { name });
      spinner.succeed(`Created project ${data.project.name}`);
    } catch (error: any) {
      spinner?.fail(error.response.data.error);
    } finally {
      spinner?.stop();
    }
  });

program
  .command("log")
  .argument("project", "project name")
  .argument("channel", "channel name")
  .argument("event", "event name")
  .action(async (project, channel, event) => {
    const r = await api.post<CreateLogResponse>(`/data`, { project, channel, event });
    console.log(r.data);
  });

program.parseAsync();
