import { getEnvVar } from '@app/shared/utils';
import { registerAs } from '@nestjs/config';

export interface VapidConfig {
  publicKey?: string;
  privateKey?: string;
  subject?: string;
}

export default registerAs<VapidConfig>('vapid', () => ({
  publicKey: getEnvVar('VAPID_PUBLIC_KEY'),
  privateKey: getEnvVar('VAPID_PRIVATE_KEY'),
  subject: getEnvVar('VAPID_SUBJECT'),
}));
