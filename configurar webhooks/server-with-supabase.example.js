/**
 * Example: Webhook with Supabase Integration
 * 
 * This is an example of how to integrate the webhook with Supabase
 * to store payment events in your database.
 * 
 * To use this:
 * 1. Uncomment the Supabase initialization below
 * 2. Update the event handlers to call Supabase functions
 * 3. Rename this file to server.js or merge with your existing server.js
 */

// Load environment variables
require('dotenv').config({ path: '../.env' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const express = require('express');
const app = express();

// Uncomment to use Supabase
// const { createClient } = require('@supabase/supabase-js');
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// Example handler functions
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log(`Processing successful payment: ${paymentIntent.id}`);
  
  // Example: Save to Supabase
  // const { data, error } = await supabase
  //   .from('payments')
  //   .insert({
  //     stripe_payment_id: paymentIntent.id,
  //     amount: paymentIntent.amount,
  //     currency: paymentIntent.currency,
  //     customer_id: paymentIntent.customer,
  //     status: 'succeeded',
  //     metadata: paymentIntent.metadata,
  //     created_at: new Date(paymentIntent.created * 1000)
  //   });
  
  // if (error) {
  //   console.error('Error saving payment to Supabase:', error);
  //   throw error;
  // }
  
  // Example: Send email notification
  // await sendEmailReceipt(paymentIntent);
  
  // Example: Update order status
  // await updateOrderStatus(paymentIntent.metadata.order_id, 'paid');
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log(`Processing failed payment: ${paymentIntent.id}`);
  
  // Example: Save to Supabase
  // const { data, error } = await supabase
  //   .from('payments')
  //   .insert({
  //     stripe_payment_id: paymentIntent.id,
  //     amount: paymentIntent.amount,
  //     currency: paymentIntent.currency,
  //     customer_id: paymentIntent.customer,
  //     status: 'failed',
  //     error_message: paymentIntent.last_payment_error?.message,
  //     metadata: paymentIntent.metadata,
  //     created_at: new Date(paymentIntent.created * 1000)
  //   });
  
  // Example: Send failure notification
  // await sendFailureNotification(paymentIntent);
}

async function handleChargeSucceeded(charge) {
  console.log(`Processing succeeded charge: ${charge.id}`);
  
  // Example: Update payment status in Supabase
  // const { error } = await supabase
  //   .from('payments')
  //   .update({ charge_id: charge.id, status: 'charged' })
  //   .eq('stripe_payment_id', charge.payment_intent);
}

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  let event = request.body;
  
  console.log(`\n📨 Webhook received at ${new Date().toISOString()}`);
  
  if (endpointSecret) {
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

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`✅ PaymentIntent for ${paymentIntent.amount} was successful!`);
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log(`❌ PaymentIntent failed: ${failedPayment.id}`);
        await handlePaymentIntentFailed(failedPayment);
        break;
        
      case 'charge.succeeded':
        const charge = event.data.object;
        console.log(`✅ Charge succeeded: ${charge.id}`);
        await handleChargeSucceeded(charge);
        break;
        
      default:
        console.log(`⚠️  Unhandled event type ${event.type}.`);
    }

    console.log(`✅ Event processed successfully\n`);
    response.send();
  } catch (error) {
    console.error(`❌ Error processing event:`, error.message);
    response.status(500).send({ error: 'Internal server error' });
  }
});

app.listen(4242, () => console.log('🚀 Webhook server running on port 4242'));
