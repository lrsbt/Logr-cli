import { writeFile, readFile, rename, mkdir } from "fs/promises";
import os from "os";
import path from "path";
import { Config } from "../types";

export const configDir = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
export const logrDir = path.join(configDir, "logr");
export const configPath = path.join(logrDir, "config.json");

const initFs = async () => {
  await mkdir(logrDir, { recursive: true });
};

export const readConfig = async (): Promise<Config | null> => {
  try {
    const data = await readFile(configPath, "utf8");
    return JSON.parse(data);
  } catch (e: any) {
    if (e.code === "ENOENT") return null; // file doesn't exist yet
    console.error("Error reading config:", e);
    throw e;
  }
};

export const writeConfig = async (config: Config) => {
  try {
    await initFs();
    await writeFile(configPath, JSON.stringify(config, null, 2));
  } catch (e: any) {
    console.error("Error writing config:", e);
    throw e;
  }
};

export const updateConfig = async (key: string, value: string) => {
  try {
    const r = await readFile(configPath, "utf8");

    const config = JSON.parse(r);
    config[key] = value;
    console.log(config);
    // fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    // });
  } catch (error) {
    console.log("Error updating config.");
  }
};
