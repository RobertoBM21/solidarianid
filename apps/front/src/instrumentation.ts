// eslint-disable-next-line @typescript-eslint/require-await
export async function register() {
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  ) {
    throw new Error(
      'VAPID public key is not configured. Push notifications will not work.',
    );
  }
}
