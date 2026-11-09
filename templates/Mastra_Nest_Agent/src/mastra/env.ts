import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

function findProjectRoot(startPath: string): string | undefined {
  let currentPath = resolve(startPath);

  while (true) {
    if (existsSync(join(currentPath, 'package.json'))) {
      return currentPath;
    }

    const parentPath = dirname(currentPath);
    if (parentPath === currentPath) {
      return undefined;
    }

    currentPath = parentPath;
  }
}

const projectRoot = findProjectRoot(__dirname) ?? findProjectRoot(process.cwd());
const envFileName = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';

if (projectRoot) {
  const envFilePath = join(projectRoot, envFileName);
  if (existsSync(envFilePath)) {
    process.loadEnvFile(envFilePath);
  }
}
