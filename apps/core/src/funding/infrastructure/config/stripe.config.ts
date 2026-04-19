import { getEnvVar, getSecretFromEnvVar } from '@app/shared/utils';
import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: getSecretFromEnvVar('STRIPE_SK'),
  paymentSuccessUrl: getEnvVar('STRIPE_PAYMENT_SUCCESS_URL'),
}));
