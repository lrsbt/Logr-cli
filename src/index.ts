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
import { Log, LoginResponse, Project, ProjectsResponse } from "../types";

const { BASE_URL } = process.env;

const program = new Command();

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
      } = await api.get("/auth/me");
      spinner.succeed(`You are logged in as ${user.username}.`);
    } catch (error: any) {
      if (error.status === 403) {
        spinner?.succeed("Not logged in.");
      } else {
        spinner?.fail("Error getting status!");
      }
    }
  });

program.command("projects").action(async () => {
  let spinner;
  try {
    spinner = ora().start();
    const config = await readConfig();
    if (!config?.api_key) spinner?.fail("Please log in via `logr login`");

    const { data } = await api.get<ProjectsResponse>("/projects");
    spinner.succeed("Projects:");

    // Creat Table Output
    const tableContent = data.map((d) => [d.name, d.created_at]);
    var t = new table({
      head: ["Name", "Created"],
      chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" },
    });
    t.push(...tableContent);
    console.log(t.toString());

    // console.log('Project info via "logr project <name>"');
  } catch (error: any) {
    if (error.status === 403) {
      spinner?.succeed("Not logged in.");
    } else {
      spinner?.fail("Error getting projects.");
    }
  }
});

program
  .command("project")
  .argument("name", "project name")
  .action(async (name) => {
    let spinner;
    try {
      spinner = ora().start();
      const config = await readConfig();
      if (!config?.api_key) spinner?.fail("Please log in via `logr login`");

      const { data } = await api.get<Log[]>(`/projects/${name}`);
      spinner.stop();

      // Creat Table Output
      const tableContent = data.map((d) => [d.id, d.channel, d.event, d.created_at]);
      var t = new table({
        head: ["ID", "Channel", "Event", "Created at"],
        chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" },
      });
      t.push(...tableContent);
      console.log(t.toString());
    } catch (error: any) {
      if (error.status === 403) {
        spinner?.succeed("Not logged in.");
      } else {
        spinner?.fail("Error getting project.");
      }
    }
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
    const r = await api.post(`/data`, { project, channel, event });
    console.log(r.data);
  });

program.parseAsync();
