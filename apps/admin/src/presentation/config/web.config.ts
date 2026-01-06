import { getSecretFromEnvVar } from '@app/shared/utils';
import { registerAs } from '@nestjs/config';

export default registerAs('web', () => ({
  sessionSecret: getSecretFromEnvVar('SESSION_SECRET'),
}));
