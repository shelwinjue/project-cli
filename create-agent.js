import {
  cp,
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { getCodingAgent } from "./coding-agents.js";

const PROJECT_NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const AGENT_PREFIX_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const EXCLUDED_DIRECTORIES = new Set([
  "node_modules",
  "build",
  "coverage",
  ".mastra",
]);
const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".js",
  ".mjs",
  ".json",
  ".md",
  ".yaml",
  ".yml",
]);
const TEXT_FILE_NAMES = new Set([
  ".env.example",
  ".prettierignore",
  ".prettierrc",
  "Dockerfile",
  "Jenkinsfile",
  ".gitignore",
]);

export function validateAgentProjectName(projectName) {
  if (!PROJECT_NAME_PATTERN.test(projectName)) {
    throw new Error(
      `项目名称“${projectName}”不合法，请使用小写字母、数字和中划线，且长度不能超过 63 个字符`,
    );
  }
}

export function validateAgentPrefix(prefix) {
  if (!AGENT_PREFIX_PATTERN.test(prefix)) {
    throw new Error(
      `接口前缀“${prefix}”不合法，请使用小写字母、数字和中划线，且不要包含 /，长度不能超过 63 个字符`,
    );
  }
}

export function validateCodingAgent(codingAgent) {
  if (!getCodingAgent(codingAgent)) {
    throw new Error(
      `Agent“${codingAgent}”不受支持，请使用 codex、trae、cursor 或 github-copilot`,
    );
  }
}

export function parseCodingAgents(codingAgents) {
  const values = (codingAgents ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (values.length === 0) {
    return [];
  }

  const uniqueValues = [...new Set(values)];
  uniqueValues.forEach(validateCodingAgent);
  return uniqueValues;
}

function shouldCopyTemplateEntry(sourcePath) {
  const name = basename(sourcePath);
  if (EXCLUDED_DIRECTORIES.has(name)) return false;
  if (name.startsWith(".env") && name !== ".env.example") return false;
  return true;
}

async function assertTargetDirectoryIsSafe(targetDirectory) {
  try {
    const targetStat = await stat(targetDirectory);
    if (!targetStat.isDirectory()) {
      throw new Error(`目标路径不是文件夹：${targetDirectory}`);
    }

    const entries = await readdir(targetDirectory);
    const conflicts = entries.filter((entry) => entry !== ".git");
    if (conflicts.length > 0) {
      throw new Error(
        `目标文件夹不是空文件夹，存在以下文件：${conflicts.sort().join("、")}`,
      );
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

function isTextFile(fileName) {
  return (
    TEXT_FILE_NAMES.has(fileName) || TEXT_EXTENSIONS.has(extname(fileName))
  );
}

async function replaceTemplateValues(directory, replacements) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await replaceTemplateValues(filePath, replacements);
      continue;
    }
    if (!entry.isFile() || !isTextFile(entry.name)) continue;

    const original = await readFile(filePath, "utf8");
    let updated = original;
    for (const [searchValue, replacementValue] of replacements) {
      updated = updated.replaceAll(searchValue, () => replacementValue);
    }
    if (updated !== original) {
      await writeFile(filePath, updated, "utf8");
    }
  }
}

export async function prepareAgentProject({
  cwd,
  projectArgument,
  prefix,
  codingAgent,
  templateDirectory,
}) {
  const projectName = projectArgument ?? basename(resolve(cwd));
  validateAgentProjectName(projectName);
  validateAgentPrefix(prefix);
  parseCodingAgents(codingAgent);

  const templateStat = await stat(templateDirectory);
  if (!templateStat.isDirectory()) {
    throw new Error(`Agent 项目模板不存在：${templateDirectory}`);
  }

  const targetDirectory = projectArgument
    ? resolve(cwd, projectArgument)
    : resolve(cwd);
  await assertTargetDirectoryIsSafe(targetDirectory);

  return { projectName, targetDirectory };
}

export async function createAgentProject({
  cwd,
  projectArgument,
  gitUrl,
  prefix,
  codingAgent,
  templateDirectory,
}) {
  const plan = await prepareAgentProject({
    cwd,
    projectArgument,
    prefix,
    codingAgent,
    templateDirectory,
  });
  await mkdir(plan.targetDirectory, { recursive: true });

  await cp(templateDirectory, plan.targetDirectory, {
    recursive: true,
    force: false,
    errorOnExist: true,
    filter: shouldCopyTemplateEntry,
  });

  await rename(
    join(plan.targetDirectory, "gitignore"),
    join(plan.targetDirectory, ".gitignore"),
  );

  const databaseName = plan.projectName.replaceAll("-", "_");
  const codingAgents = parseCodingAgents(codingAgent);
  const normalizedCodingAgents = codingAgents.join(",");
  const skillsDirectories = [
    ...new Set(
      codingAgents.map((agent) => getCodingAgent(agent).skillsDirectory),
    ),
  ];
  const replacements = [
    ["${YOUR_PROJECT_NAME}", plan.projectName],
    ["${YOUR_DATABASE_NAME}", databaseName],
    ["${YOUR_AGENT_PREFIX}", prefix],
    ["${YOUR_CODING_AGENT}", normalizedCodingAgents || "未选择"],
    ["${YOUR_CODING_AGENT_ARGUMENT}", normalizedCodingAgents],
    [
      "${YOUR_AGENT_SKILLS_DIRECTORY}",
      skillsDirectories.length > 0 ? skillsDirectories.join(", ") : "不安装",
    ],
    ["mastra-nest-agent-starter", plan.projectName],
    ["MYSQL_DATABASE=agent_app", `MYSQL_DATABASE=${databaseName}`],
  ];

  if (gitUrl) {
    replacements.push(["${YOUR_GIT_URL}", gitUrl]);
  }

  await replaceTemplateValues(plan.targetDirectory, replacements);

  return {
    ...plan,
    databaseName,
    prefix,
    codingAgents,
    skillsDirectories,
    mastraStudioPrefix: `/api/${prefix}/mastra-studio`,
  };
}
