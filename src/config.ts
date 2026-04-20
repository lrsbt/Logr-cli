import fs from "fs";
import os from "os";
import path from "path";
import { Config } from "../types";

const configDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");

const logrDir = path.join(configDir, "logr");
const configPath = path.join(logrDir, "config.json");

const initFs = () => {
  if (!fs.existsSync(logrDir)) {
    fs.mkdirSync(logrDir, { recursive: true });
  }
};

// Update?
export const writeConfig = (config: Config) => {
  initFs();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};

export const updateConfig = (key: string, value: string) => {
  try {
    fs.readFile(configPath, "utf-8", (err, data) => {
      const config = JSON.parse(data);
      config[key] = value;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    });
  } catch (error) {
    console.log("Error updating config.");
  }
};

export const readConfig = () => {
  fs.readFile(configPath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }
    return JSON.parse(data) as Config;
  });
};
