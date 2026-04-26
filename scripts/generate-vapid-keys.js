const webpush = require('web-push');
const fs = require('fs');

const envFile = process.argv[2];

if (!envFile) {
  console.error('Please provide a file name (e.g., npm run gen -- .env.test)');
  process.exit(1);
}

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

const content = `
VAPID_PUBLIC_KEY=${publicKey}
VAPID_PRIVATE_KEY=${privateKey}
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}
`;

try {
  fs.appendFileSync(envFile, content);
  console.log('VAPID keys generated and added to', envFile);
} catch (err) {
  console.error('Error writing to file:', err);
  process.exit(1);
}
