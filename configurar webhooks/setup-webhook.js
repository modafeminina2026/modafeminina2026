#!/usr/bin/env node

/**
 * Setup script to help configure the webhook
 * This script guides you through setting up your Stripe webhook
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function setup() {
  console.log('\n🎯 Stripe Webhook Setup\n');
  console.log('This script will help you configure your Stripe webhook.\n');

  console.log('📋 Prerequisites:');
  console.log('  1. Install Stripe CLI: https://github.com/stripe/stripe-cli');
  console.log('  2. Run: stripe login');
  console.log('  3. Run: stripe listen --forward-to localhost:4242/webhook\n');

  const secret = await question('Enter your webhook signing secret (whsec_...): ');
  
  if (!secret.startsWith('whsec_')) {
    console.log('\n❌ Invalid webhook secret. It should start with "whsec_"\n');
    rl.close();
    process.exit(1);
  }

  // Update .env file
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace or add STRIPE_WEBHOOK_SECRET
  if (envContent.includes('STRIPE_WEBHOOK_SECRET=')) {
    envContent = envContent.replace(
      /STRIPE_WEBHOOK_SECRET=.*/,
      `STRIPE_WEBHOOK_SECRET=${secret}`
    );
  } else {
    envContent += `\nSTRIPE_WEBHOOK_SECRET=${secret}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Webhook secret saved to .env\n');
  console.log('🚀 You can now start the server with: npm start\n');
  
  rl.close();
}

setup().catch(err => {
  console.error('❌ Error:', err.message);
  rl.close();
  process.exit(1);
});
