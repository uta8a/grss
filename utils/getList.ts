import yaml from "js-yaml";
import * as fs from "fs";
import { Targets } from "@/types/grss";

const loadYaml = () => {
  const rawYaml = fs.readFileSync(`${process.cwd()}/rss/rss.yaml`, "utf-8");
  const data: Targets = yaml.load(rawYaml) as Targets;
  console.log(data);
  return data;
};

export { loadYaml };
