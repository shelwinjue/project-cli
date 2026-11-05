import { existsSync } from 'node:fs';

const envFilePath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';

if (existsSync(envFilePath)) {
  process.loadEnvFile(envFilePath);
}

export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
});
