// Load environment variables
require('dotenv').config({ path: '../.env' });

// This is your secret API key.
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const express = require('express');
const app = express();

app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  let event = request.body;
  
  console.log(`\n📨 Webhook received at ${new Date().toISOString()}`);
  
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
      console.log(`✅ Webhook signature verified`);
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  } else {
    console.log(`⚠️  No endpoint secret configured. Webhook signature verification skipped.`);
    event = JSON.parse(request.body);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`✅ PaymentIntent for ${paymentIntent.amount} was successful!`);
      console.log(`   ID: ${paymentIntent.id}`);
      console.log(`   Customer: ${paymentIntent.customer}`);
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log(`❌ PaymentIntent failed: ${failedPayment.id}`);
      console.log(`   Error: ${failedPayment.last_payment_error?.message}`);
      break;
    case 'charge.succeeded':
      const charge = event.data.object;
      console.log(`✅ Charge succeeded: ${charge.id}`);
      break;
    case 'charge.failed':
      const failedCharge = event.data.object;
      console.log(`❌ Charge failed: ${failedCharge.id}`);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log(`✅ PaymentMethod attached: ${paymentMethod.id}`);
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    default:
      // Unexpected event type
      console.log(`⚠️  Unhandled event type ${event.type}.`);
  }

  // Return a 200 response to acknowledge receipt of the event
  console.log(`✅ Event processed successfully\n`);
  response.send();
});

app.listen(4242, () => console.log('🚀 Webhook server running on port 4242'));