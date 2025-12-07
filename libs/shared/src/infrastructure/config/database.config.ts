import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getEnvVar, getEnvVarAsInt, getFileFromEnvVar } from '../../utils';

export default registerAs<TypeOrmModuleOptions>('database', () => ({
  type: 'postgres',
  host: getEnvVar('DB_HOST'),
  port: getEnvVarAsInt('DB_PORT', 5432),
  username: getEnvVar('DB_USER'),
  password: getFileFromEnvVar('DB_PASSWORD_FILE'),
  database: getEnvVar('DB_NAME'),
  autoLoadEntities: true,

  // Paula (2025-12-24): auto sync is not ok for production, but they didn't teach us migrations
  synchronize: true,
}));
