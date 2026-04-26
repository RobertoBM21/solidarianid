import { getEnvVar, getSecretFromEnvVar } from '@app/shared/utils';
import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: getSecretFromEnvVar('STRIPE_SK'),
  paymentSuccessUrl:
    getEnvVar('FRONTEND_URL') +
    '/donations/complete?checkoutSessionId={CHECKOUT_SESSION_ID}',
}));
