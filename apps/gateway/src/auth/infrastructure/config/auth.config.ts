import { getEnvVar, getSecretFromEnvVar } from '@app/shared/utils';
import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: getSecretFromEnvVar('JWT_SECRET'),
  jwtExpiration: getEnvVar('JWT_EXPIRATION'),
  google: {
    clientId: getEnvVar('GOOGLE_CLIENT_ID'),
    clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET'),
    callbackUrl: getEnvVar('FRONTEND_URL') + '/auth/google/callback',
  },
  frontendUrl: getEnvVar('FRONTEND_URL'),
  coreUrl: getEnvVar('CORE_URL'),
}));
