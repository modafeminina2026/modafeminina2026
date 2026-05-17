# Testing the Webhook

## Prerequisites

1. Install the Stripe CLI: https://github.com/stripe/stripe-cli
2. Have your Stripe account credentials ready

## Step 1: Start the Webhook Server

```bash
npm start
```

The server will start on `http://localhost:4242/webhook`

## Step 2: Get Your Webhook Signing Secret

Run the Stripe CLI to listen for events:

```bash
stripe login
stripe listen --forward-to localhost:4242/webhook
```

The CLI will output something like:
```
> Ready! Your webhook signing secret is: whsec_test_...
```

Copy this secret and update it in your `.env` file:
```
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

## Step 3: Simulate Events

In another terminal, trigger test events:

```bash
# Test successful payment
stripe trigger payment_intent.succeeded

# Test failed payment
stripe trigger payment_intent.payment_failed

# Test charge succeeded
stripe trigger charge.succeeded

# Test charge failed
stripe trigger charge.failed

# Test payment method attached
stripe trigger payment_method.attached
```

## Step 4: Monitor the Logs

Watch the server logs to see the webhook events being processed. You should see output like:

```
📨 Webhook received at 2026-05-16T10:30:45.123Z
✅ Webhook signature verified
✅ PaymentIntent for 2000 was successful!
   ID: pi_1234567890
   Customer: cus_1234567890
✅ Event processed successfully
```

## Troubleshooting

### Webhook signature verification failed

- Make sure you copied the correct `STRIPE_WEBHOOK_SECRET` from the CLI output
- Restart the server after updating the secret
- Make sure the `.env` file is in the root directory of the project

### No events received

- Make sure the Stripe CLI is running with `stripe listen --forward-to localhost:4242/webhook`
- Check that the server is running on port 4242
- Verify your Stripe account is logged in with `stripe login`

### Connection refused

- Make sure the server is running: `npm start`
- Check that port 4242 is not in use by another application
