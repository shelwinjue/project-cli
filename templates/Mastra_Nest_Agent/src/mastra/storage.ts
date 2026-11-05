import './env.js';

import { MySQLStore } from '@mastra/mysql';

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`缺少环境变量 ${name}`);
  }
  return value;
}

function getMySqlPort(): number {
  const port = Number(process.env.MYSQL_PORT?.trim() || '3306');
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('MYSQL_PORT 必须是 1 到 65535 之间的整数');
  }
  return port;
}

const mysqlStorage = new MySQLStore({
  id: 'mastra-storage',
  host: requireEnvironmentVariable('MYSQL_HOST'),
  port: getMySqlPort(),
  user: requireEnvironmentVariable('MYSQL_USER'),
  password: requireEnvironmentVariable('MYSQL_PASSWORD'),
  database: requireEnvironmentVariable('MYSQL_DATABASE'),
});

mysqlStorage.stores = {
  memory: mysqlStorage.stores.memory,
  observability: mysqlStorage.stores.observability,
};

export const storage = mysqlStorage;
