import { getFileFromEnvVar } from '@app/shared/utils';
import { registerAs } from '@nestjs/config';

export default registerAs('web', () => ({
  sessionSecret: getFileFromEnvVar('SESSION_SECRET_FILE'),
}));
