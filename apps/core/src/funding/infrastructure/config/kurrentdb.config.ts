import { getEnvVar } from '@app/shared/utils';
import { registerAs } from '@nestjs/config';

export interface KurrentDbConfig {
  connectionString: string;
}

export const KURRENTDB_CLIENT = 'KURRENTDB_CLIENT';

export const kurrentDbConfig = registerAs<KurrentDbConfig>('kurrentdb', () => ({
  connectionString: getEnvVar('KURRENTDB_URL'),
}));
