# Build a Webhook Endpoint

Build a simple webhook endpoint to listen to events from Stripe. This implementation includes signature verification and handles multiple event types.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your Webhook Secret

Run the Stripe CLI to get your webhook signing secret:

```bash
stripe login
stripe listen --forward-to localhost:4242/webhook
```

Copy the signing secret (starts with `whsec_`) and run:

```bash
npm run setup
```

Or manually add it to your `.env` file:

```
STRIPE_WEBHOOK_SECRET=whsec_test_...
```

### 3. Start the Server

```bash
npm start
```

The webhook will be available at `http://localhost:4242/webhook`

## Testing the Webhook

With the server running and Stripe CLI listening, trigger test events:

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

Watch the server logs to see the events being processed.

## Supported Events

- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `charge.succeeded` - Charge succeeded
- `charge.failed` - Charge failed
- `payment_method.attached` - Payment method attached to customer

## Security

This webhook implementation includes:

- ✅ Stripe signature verification
- ✅ Environment variable protection (no hardcoded secrets)
- ✅ Error handling for malformed requests
- ✅ Proper HTTP status codes

## Deployment

Before deploying to production:

1. Update your webhook endpoint URL in the Stripe Dashboard
2. Use your production Stripe keys (not test keys)
3. Implement proper error handling and logging
4. Add database operations to handle events
5. Consider using a message queue for long-running operations

For more details, see [TESTING.md](./TESTING.md)
