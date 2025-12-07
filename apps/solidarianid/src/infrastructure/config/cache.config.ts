import { getEnvVar } from '@app/shared/utils';
import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  url: getEnvVar('REDIS_URL'),
}));
