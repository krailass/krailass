// Generate a VAPID keypair for Web Push. Run: npm run gen:vapid
import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();
console.log('\nAdd these to your .env.local (and Vercel env):\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
console.log('VAPID_SUBJECT=mailto:admin@sawai.local\n');
