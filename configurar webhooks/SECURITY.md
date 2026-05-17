# Webhook Security Checklist

## Before Going to Production

### ✅ Signature Verification
- [x] Webhook signature verification is implemented
- [x] Using raw request body for verification (not parsed JSON)
- [x] Endpoint secret is stored in environment variables
- [x] Proper error handling for verification failures

### ✅ Environment Variables
- [x] No hardcoded secrets in code
- [x] Using `.env` file for local development
- [x] `.env` file is in `.gitignore`
- [x] Production secrets are set in deployment platform

### ✅ Error Handling
- [x] Returning 200 status code for successful processing
- [x] Returning 400 for signature verification failures
- [x] Returning 500 for server errors
- [x] Logging all errors for debugging

### ✅ Request Validation
- [x] Verifying `stripe-signature` header exists
- [x] Handling malformed JSON gracefully
- [x] Validating event type before processing
- [x] Checking required fields in event data

### ✅ Idempotency
- [ ] Implementing idempotency keys for database operations
- [ ] Checking if event was already processed
- [ ] Handling duplicate events gracefully

### ✅ Rate Limiting
- [ ] Implementing rate limiting on webhook endpoint
- [ ] Protecting against DDoS attacks
- [ ] Monitoring for unusual traffic patterns

### ✅ Logging & Monitoring
- [ ] Logging all webhook events
- [ ] Logging all errors with context
- [ ] Setting up alerts for failures
- [ ] Monitoring webhook delivery status in Stripe Dashboard

### ✅ Database Security
- [ ] Using parameterized queries (if applicable)
- [ ] Validating all input data
- [ ] Using service role key only for server-side operations
- [ ] Implementing Row Level Security (RLS) in Supabase

### ✅ HTTPS & TLS
- [x] Using HTTPS in production
- [x] Valid SSL certificate
- [x] TLS 1.2 or higher

### ✅ Access Control
- [ ] Webhook endpoint is not authenticated (Stripe sends unsigned requests)
- [ ] But signature verification acts as authentication
- [ ] Restricting database access to webhook service account
- [ ] Using service role key only on server-side

## Implementation Checklist

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Create .env file with secrets
cp .env.example .env

# 3. Get webhook signing secret
stripe login
stripe listen --forward-to localhost:4242/webhook

# 4. Update .env with signing secret
npm run setup

# 5. Start server
npm start

# 6. Test with Stripe CLI
stripe trigger payment_intent.succeeded
```

### Staging Deployment
- [ ] Deploy to staging environment
- [ ] Create staging webhook endpoint in Stripe Dashboard
- [ ] Use test API keys
- [ ] Test with real Stripe test events
- [ ] Monitor logs for errors
- [ ] Verify database operations

### Production Deployment
- [ ] Deploy to production environment
- [ ] Create production webhook endpoint in Stripe Dashboard
- [ ] Use production API keys
- [ ] Update webhook URL in Stripe Dashboard
- [ ] Test with small transaction first
- [ ] Monitor webhook deliveries
- [ ] Set up alerts for failures
- [ ] Document runbook for troubleshooting

## Common Security Issues

### ❌ Hardcoded Secrets
```javascript
// BAD
const stripe = require('stripe')('sk_live_...');

// GOOD
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

### ❌ Using Parsed JSON for Verification
```javascript
// BAD
const event = JSON.parse(request.body);
stripe.webhooks.constructEvent(event, signature, secret);

// GOOD
stripe.webhooks.constructEvent(request.body, signature, secret);
```

### ❌ Not Verifying Signature
```javascript
// BAD
app.post('/webhook', (req, res) => {
  const event = JSON.parse(req.body);
  // Process event without verification
});

// GOOD
app.post('/webhook', (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
  );
  // Process verified event
});
```

### ❌ Not Handling Errors
```javascript
// BAD
app.post('/webhook', (req, res) => {
  const event = stripe.webhooks.constructEvent(...);
  // No error handling
  res.send();
});

// GOOD
app.post('/webhook', (req, res) => {
  try {
    const event = stripe.webhooks.constructEvent(...);
    res.send();
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

## Monitoring & Alerts

### Set Up Alerts For:
- [ ] Webhook signature verification failures
- [ ] Database connection errors
- [ ] High error rate (>5% of events)
- [ ] Webhook delivery delays
- [ ] Unusual traffic patterns

### Monitor These Metrics:
- [ ] Webhook delivery success rate
- [ ] Average processing time
- [ ] Error rate by event type
- [ ] Database operation latency
- [ ] Server uptime

## Incident Response

### If Webhook Fails:
1. Check server logs for errors
2. Verify Stripe Dashboard for failed deliveries
3. Check database connectivity
4. Verify environment variables are correct
5. Retry failed events from Stripe Dashboard

### If Signature Verification Fails:
1. Verify endpoint secret is correct
2. Restart server after updating secret
3. Check that raw request body is being used
4. Verify Stripe CLI is using correct account

### If Database Operations Fail:
1. Check database connection
2. Verify table schema
3. Check for permission issues
4. Review database logs
5. Verify data types match schema

## References

- [Stripe Webhook Security](https://stripe.com/docs/webhooks/best-practices)
- [Stripe API Keys Best Practices](https://stripe.com/docs/keys-best-practices)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
