import {
  access,
  lstat,
  mkdir,
  readFile,
  readdir,
  readlink,
  rm,
  symlink,
} from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const mastraScopeDirectory = join(projectRoot, 'node_modules', '@mastra');
const agentSkillsDirectories = Object.freeze({
  codex: '.agents/skills',
  trae: '.trae/skills',
  cursor: '.cursor/skills',
  'github-copilot': '.agents/skills',
});

function readSkillName(source, skillFile) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const name = frontmatter?.[1].match(
    /^name:\s*["']?([^"'\r\n]+)["']?\s*$/m,
  )?.[1];

  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error(`Invalid or missing skill name in ${skillFile}`);
  }

  return name;
}

function readOption(argv, optionName) {
  const optionIndex = argv.indexOf(optionName);
  if (optionIndex >= 0) {
    return argv[optionIndex + 1];
  }

  const optionPrefix = `${optionName}=`;
  return argv.find((argument) => argument.startsWith(optionPrefix))?.slice(
    optionPrefix.length,
  );
}

export function readArguments(argv, environment = process.env) {
  const agentValue = readOption(argv, '--agent') ?? environment.npm_config_agent;
  const agents = (agentValue ?? '')
    .split(',')
    .map((agent) => agent.trim().toLowerCase())
    .filter(Boolean);

  if (agents.length === 0) {
    throw new Error('Missing --agent.');
  }

  const uniqueAgents = [...new Set(agents)];
  const unsupportedAgents = uniqueAgents.filter(
    (agent) => !Object.hasOwn(agentSkillsDirectories, agent),
  );
  if (unsupportedAgents.length > 0) {
    throw new Error(
      `Unsupported Agent: ${unsupportedAgents.join(', ')}. Use codex, trae, cursor, or github-copilot.`,
    );
  }

  return { agents: uniqueAgents };
}

function resolveSkillsDirectory(skillsDirectoryArgument) {
  if (!skillsDirectoryArgument) {
    throw new Error('Missing --skills-dir.');
  }

  const skillsDirectory = resolve(projectRoot, skillsDirectoryArgument);
  const relativeDirectory = relative(projectRoot, skillsDirectory);
  if (
    relativeDirectory === '' ||
    relativeDirectory === '..' ||
    relativeDirectory.startsWith(`..${sep}`)
  ) {
    throw new Error('--skills-dir must be a directory inside the project.');
  }

  return skillsDirectory;
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function discoverMastraSkills() {
  if (!(await pathExists(mastraScopeDirectory))) {
    return [];
  }

  const packages = await readdir(mastraScopeDirectory, { withFileTypes: true });
  const skills = [];

  for (const packageEntry of packages) {
    if (!packageEntry.isDirectory() && !packageEntry.isSymbolicLink()) {
      continue;
    }

    const docsDirectory = join(
      mastraScopeDirectory,
      packageEntry.name,
      'dist',
      'docs',
    );
    const skillFile = join(docsDirectory, 'SKILL.md');

    if (!(await pathExists(skillFile))) {
      continue;
    }

    const source = await readFile(skillFile, 'utf8');
    const name = readSkillName(source, skillFile);
    if (skills.some((skill) => skill.name === name)) {
      throw new Error(`Duplicate embedded Mastra skill name: ${name}`);
    }

    skills.push({
      name,
      packageName: `@mastra/${packageEntry.name}`,
      docsDirectory,
    });
  }

  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

function resolveLinkTarget(skillsDirectory, target) {
  const normalizedTarget = target.startsWith('\\\\?\\')
    ? target.slice(4)
    : target;
  return resolve(skillsDirectory, normalizedTarget);
}

function isEmbeddedMastraDocsTarget(target) {
  const relativeTarget = relative(mastraScopeDirectory, target);
  return (
    relativeTarget !== '' &&
    relativeTarget !== '..' &&
    !relativeTarget.startsWith(`..${sep}`) &&
    relativeTarget.endsWith(join('dist', 'docs'))
  );
}

async function removeStaleManagedLinks(skillsDirectory, activeNames) {
  if (!(await pathExists(skillsDirectory))) {
    return;
  }

  const entries = await readdir(skillsDirectory, { withFileTypes: true });

  for (const entry of entries) {
    if (activeNames.has(entry.name)) {
      continue;
    }

    const linkPath = join(skillsDirectory, entry.name);
    const stats = await lstat(linkPath);

    if (!stats.isSymbolicLink()) {
      continue;
    }

    const target = resolveLinkTarget(skillsDirectory, await readlink(linkPath));
    if (isEmbeddedMastraDocsTarget(target)) {
      await rm(linkPath, { force: true });
      console.log(`Removed stale Mastra skill link: ${entry.name}`);
    }
  }
}

async function ensureSkillLink(skillsDirectory, skill) {
  const linkPath = join(skillsDirectory, skill.name);
  let stats;

  try {
    stats = await lstat(linkPath);
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }

  if (stats) {
    if (!stats.isSymbolicLink()) {
      throw new Error(
        `Cannot link ${skill.packageName}: ${linkPath} already exists and is not a symbolic link.`,
      );
    }

    const currentTarget = resolveLinkTarget(
      skillsDirectory,
      await readlink(linkPath),
    );
    if (currentTarget === skill.docsDirectory) {
      console.log(`Mastra skill already linked: ${skill.name}`);
      return;
    }

    await rm(linkPath, { force: true });
  }

  await symlink(
    skill.docsDirectory,
    linkPath,
    process.platform === 'win32' ? 'junction' : 'dir',
  );
  console.log(`Linked ${skill.name} from ${skill.packageName}`);
}

export async function linkMastraSkills({ agents }) {
  const skills = await discoverMastraSkills();

  if (skills.length === 0) {
    console.log('No installed Mastra packages expose dist/docs/SKILL.md.');
    return [];
  }

  const targetsByDirectory = new Map();
  for (const agent of agents) {
    const skillsDirectory = resolveSkillsDirectory(
      agentSkillsDirectories[agent],
    );
    const target = targetsByDirectory.get(skillsDirectory) ?? {
      agents: [],
      skillsDirectory,
    };
    target.agents.push(agent);
    targetsByDirectory.set(skillsDirectory, target);
  }

  for (const target of targetsByDirectory.values()) {
    await mkdir(target.skillsDirectory, { recursive: true });
    await removeStaleManagedLinks(
      target.skillsDirectory,
      new Set(skills.map((skill) => skill.name)),
    );

    for (const skill of skills) {
      await ensureSkillLink(target.skillsDirectory, skill);
    }

    console.log(
      `Linked ${skills.length} embedded Mastra skills for ${target.agents.join(', ')}.`,
    );
  }

  return skills;
}

const invokedDirectly =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  Promise.resolve()
    .then(() => readArguments(process.argv.slice(2)))
    .then((options) => linkMastraSkills(options))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
