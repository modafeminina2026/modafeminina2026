# Webhook Integration Guide

This guide shows how to integrate the Stripe webhook with your Nuxt application and Supabase database.

## Architecture

```
Stripe Payment → Stripe Webhook → Node.js Server → Supabase Database
                                                  → Email Service
                                                  → Order Processing
```

## Step 1: Create a Payments Table in Supabase

```sql
CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  stripe_payment_id TEXT UNIQUE NOT NULL,
  charge_id TEXT,
  customer_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
```

## Step 2: Update Your Webhook Server

Use the example in `server-with-supabase.example.js` as a reference:

```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function handlePaymentIntentSucceeded(paymentIntent) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      stripe_payment_id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer_id: paymentIntent.customer,
      status: 'succeeded',
      metadata: paymentIntent.metadata,
      created_at: new Date(paymentIntent.created * 1000)
    });
  
  if (error) throw error;
}
```

## Step 3: Configure Webhook in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `charge.failed`
5. Copy the signing secret and add to your `.env`

## Step 4: Query Payments in Your Nuxt App

Create a composable to fetch payments:

```typescript
// app/composable/usePayments.ts
export const usePayments = () => {
  const supabase = useSupabaseClient();

  const getPaymentStatus = async (paymentId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_payment_id', paymentId)
      .single();

    if (error) throw error;
    return data;
  };

  const getCustomerPayments = async (customerId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  return {
    getPaymentStatus,
    getCustomerPayments
  };
};
```

## Step 5: Handle Webhook Events

Common patterns for handling events:

### Send Email Receipt
```javascript
async function sendEmailReceipt(paymentIntent) {
  // Use your email service (SendGrid, Resend, etc.)
  await emailService.send({
    to: paymentIntent.receipt_email,
    subject: 'Payment Receipt',
    template: 'receipt',
    data: {
      amount: paymentIntent.amount,
      date: new Date(paymentIntent.created * 1000)
    }
  });
}
```

### Update Order Status
```javascript
async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date() })
    .eq('id', orderId);
  
  if (error) throw error;
}
```

### Trigger Fulfillment
```javascript
async function triggerFulfillment(paymentIntent) {
  // Send to fulfillment service
  await fulfillmentService.process({
    orderId: paymentIntent.metadata.order_id,
    items: paymentIntent.metadata.items
  });
}
```

## Testing Integration

1. Start the webhook server:
   ```bash
   npm start
   ```

2. In another terminal, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:4242/webhook
   stripe trigger payment_intent.succeeded
   ```

3. Check your Supabase database to verify the payment was recorded

## Production Deployment

### Using Vercel Edge Functions

Create `api/webhook.ts`:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const signature = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle event...
    
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
```

### Using AWS Lambda

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const signature = event.headers['stripe-signature'];
  
  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle event...
    
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

## Monitoring

Monitor your webhooks in the Stripe Dashboard:

1. Go to https://dashboard.stripe.com/webhooks
2. Click on your endpoint
3. View recent deliveries and their status
4. Check for failed deliveries and retry them

## Troubleshooting

### Webhook not receiving events
- Verify the endpoint URL is publicly accessible
- Check that the signing secret is correct
- Ensure the server is running and listening on the correct port

### Signature verification failed
- Make sure you're using the correct signing secret
- Verify the raw request body is being used (not parsed JSON)

### Events not being saved to database
- Check Supabase connection credentials
- Verify the table schema matches your insert data
- Check server logs for database errors

## Security Best Practices

1. ✅ Always verify webhook signatures
2. ✅ Use environment variables for secrets
3. ✅ Implement rate limiting
4. ✅ Log all webhook events
5. ✅ Handle errors gracefully
6. ✅ Use HTTPS in production
7. ✅ Implement idempotency (handle duplicate events)
8. ✅ Set up monitoring and alerts
