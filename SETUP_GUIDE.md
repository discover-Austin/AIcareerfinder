# AI Career Path Finder - Complete Setup Guide

This guide will help you set up the AI Career Path Finder with all monetization features including Stripe payments, PDF export, analytics, and email delivery.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Stripe Payment Integration](#stripe-payment-integration)
4. [Google Analytics Setup](#google-analytics-setup)
5. [Email Delivery Setup](#email-delivery-setup)
6. [Backend API Setup](#backend-api-setup)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)
- Google Gemini API key (for AI features)

### Basic Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/AIcareerfinder.git
cd AIcareerfinder
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add at minimum:
```env
API_KEY=your_gemini_api_key_here
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to `http://localhost:4200`

At this point, the app will work with mock payments and basic features. Continue reading to enable full monetization features.

---

## Environment Setup

### 1. Google Gemini API Key (Required)

The app uses Google's Gemini AI for personality analysis and career recommendations.

**Steps:**
1. Go to [https://ai.google.dev/](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API key in Google AI Studio"
4. Create a new API key
5. Copy the key and add to `.env`:
   ```env
   API_KEY=AIza...your_key_here
   ```

**Cost:** Free tier includes 60 requests per minute. See [pricing](https://ai.google.dev/pricing) for details.

---

## Stripe Payment Integration

Stripe handles all payment processing, subscriptions, and billing.

### Step 1: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete account setup (you'll need to verify your business info for live mode)

### Step 2: Get API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers > API keys**
3. You'll see two types of keys:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode)

4. Copy the **publishable key** (safe to use in frontend):
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
   ```

5. Keep the secret key for backend use (NEVER expose in frontend)

### Step 3: Create Products and Prices

1. Go to **Products** in Stripe Dashboard
2. Click **Add product**
3. Create two products:

**Premium Plan:**
- Name: `Premium Subscription`
- Description: `Full access to AI career analysis and premium features`
- Pricing:
  - Monthly: `$14.99/month` (recurring)
  - Yearly: `$149/year` (recurring, annual)

**Professional Plan:**
- Name: `Professional Subscription`
- Description: `Everything in Premium plus job matching and mentorship`
- Pricing:
  - Monthly: `$29.99/month` (recurring)
  - Yearly: `$299/year` (recurring, annual)

4. After creating each price, copy the **Price ID** (starts with `price_`)
5. Update `src/models/subscription.model.ts`:

```typescript
{
  id: 'premium-monthly',
  stripePriceId: 'price_1ABC...your_actual_price_id',  // ← Replace this
  // ... rest of config
}
```

### Step 4: Set Up Webhooks (Required for Production)

Webhooks notify your backend when subscription events occur (payment success, cancellation, etc.).

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/stripe-webhook`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to backend .env:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

### Step 5: Test Mode vs Live Mode

- **Test Mode**: Use test API keys (pk_test_, sk_test_) for development
- **Live Mode**: Switch to live keys (pk_live_, sk_live_) only in production

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

---

## Google Analytics Setup

Track user behavior, conversions, and optimize your funnel.

### Step 1: Create Google Analytics Property

1. Go to [https://analytics.google.com/](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **Admin** (gear icon)
4. Create a new property:
   - Property name: `AI Career Finder`
   - Time zone and currency: Select yours
   - Click **Next**
5. About your business: Fill in details
6. Click **Create**
7. Accept Terms of Service

### Step 2: Set Up Data Stream

1. In Property settings, click **Data Streams**
2. Click **Add stream > Web**
3. Website URL: `https://yourdomain.com` (use localhost for dev)
4. Stream name: `AI Career Finder - Production`
5. Click **Create stream**

### Step 3: Get Measurement ID

1. You'll see your **Measurement ID** (format: `G-XXXXXXXXXX`)
2. Copy it and add to `.env`:
   ```env
   GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### Step 4: Verify Installation

1. Run your app: `npm run dev`
2. In Google Analytics, go to **Realtime** report
3. Visit your app in a browser
4. You should see yourself in the Realtime report within seconds

### Key Metrics to Track

The app automatically tracks:
- **Engagement**: Quiz started, completed, questions answered
- **Conversion**: Signups, upgrade initiated, purchase completed
- **Features**: Career details viewed, comparisons, PDF exports
- **Paywall**: Paywall shown, dismissed, upgrade clicked

---

## Email Delivery Setup

Send welcome emails, analysis results, and upgrade confirmations.

### Option 1: SendGrid (Recommended)

**Why SendGrid:** Reliable, 100 free emails/day, good deliverability.

1. Sign up at [https://sendgrid.com/](https://sendgrid.com/)
2. Verify your sender email address
3. Create an API key:
   - Go to **Settings > API Keys**
   - Click **Create API Key**
   - Name: `AI Career Finder`
   - Permissions: **Full Access**
   - Copy the key (you'll only see it once!)
4. Add to backend `.env`:
   ```env
   SENDGRID_API_KEY=SG.your_key_here
   ```

### Option 2: Resend (Alternative)

**Why Resend:** Developer-friendly, modern API, 100 free emails/day.

1. Sign up at [https://resend.com/](https://resend.com/)
2. Verify your domain (or use their testing domain)
3. Create an API key:
   - Go to **API Keys**
   - Click **Create API Key**
   - Copy the key
4. Add to backend `.env`:
   ```env
   RESEND_API_KEY=re_your_key_here
   ```

### Implementation

Email sending requires a backend API. See [Backend API Setup](#backend-api-setup) for details.

**Example backend endpoint** (Node.js + SendGrid):

```javascript
// /api/send-analysis-email
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/send-analysis-email', async (req, res) => {
  const { toEmail, userName, analysis } = req.body;

  const msg = {
    to: toEmail,
    from: 'noreply@yourdomain.com', // Must be verified
    subject: 'Your AI Career Analysis Results',
    html: generateEmailTemplate(userName, analysis), // Use the template from email.service.ts
  };

  try {
    await sgMail.send(msg);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## Backend API Setup

The app currently uses localStorage for data (development only). For production, you need a backend API.

### Why You Need a Backend

1. **Security**: Store passwords securely (hashed), hide API keys
2. **Payments**: Handle Stripe webhooks, verify payments
3. **Emails**: Send transactional emails
4. **Persistence**: Real database instead of localStorage
5. **Analytics**: Server-side event tracking

### Recommended Stack

#### Option 1: Firebase (Fastest Setup)

**Pros:** No server management, free tier, real-time database
**Cons:** Vendor lock-in, limited customization

```bash
npm install firebase firebase-admin
```

**Features included:**
- Authentication (with email/password, Google, etc.)
- Firestore database
- Cloud Functions (for webhooks)
- Hosting

**Setup:**
1. Create project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication, Firestore
3. Deploy Cloud Functions for Stripe webhooks
4. Configure in your app

#### Option 2: Supabase (Recommended for SQL lovers)

**Pros:** PostgreSQL database, REST API auto-generated, open source
**Cons:** Learning curve

```bash
npm install @supabase/supabase-js
```

**Setup:**
1. Create project at [https://supabase.com/](https://supabase.com/)
2. Get API URL and anon key
3. Set up database schema
4. Enable Row Level Security (RLS)
5. Create Edge Functions for webhooks

#### Option 3: Custom Backend (Most Control)

**Recommended for:**
- Full control over architecture
- Complex business logic
- Custom integrations

**Tech Stack:**
- **Node.js + Express** (JavaScript)
- **Python + FastAPI** (Python)
- **NestJS** (TypeScript, enterprise-grade)

**Required Endpoints:**

```
POST   /api/auth/register          - Create user account
POST   /api/auth/login             - Log in user
POST   /api/auth/logout            - Log out user
GET    /api/users/me               - Get current user
PUT    /api/users/me               - Update user profile

POST   /api/tests                  - Save test results
GET    /api/tests/:id              - Get test by ID

POST   /api/subscriptions/checkout - Create Stripe checkout session
POST   /api/subscriptions/portal   - Create customer portal session
POST   /api/webhooks/stripe        - Handle Stripe webhooks

POST   /api/emails/send-analysis   - Send analysis email
POST   /api/emails/welcome         - Send welcome email

POST   /api/pdf/generate           - Generate PDF (optional, can be client-side)
```

**Database Schema (PostgreSQL example):**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  tier VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  archetype VARCHAR(10) NOT NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Replace all test API keys with production keys
- [ ] Set up backend API with real database
- [ ] Configure Stripe webhooks to production URL
- [ ] Verify email sending works
- [ ] Set up SSL certificate (HTTPS)
- [ ] Add Terms of Service and Privacy Policy
- [ ] Enable CORS protection on backend
- [ ] Set up error monitoring (Sentry)
- [ ] Configure production environment variables
- [ ] Test payment flow end-to-end
- [ ] Set up automated backups

### Deployment Options

#### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
```bash
npm install -g vercel
vercel login
vercel
```

**Backend (Railway):**
1. Go to [https://railway.app/](https://railway.app/)
2. Connect your GitHub repo
3. Deploy backend
4. Add environment variables

#### Option 2: Netlify + Heroku

**Frontend (Netlify):**
1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

**Backend (Heroku):**
```bash
heroku create ai-career-finder-api
git push heroku main
heroku config:set KEY=value
```

#### Option 3: AWS (Most scalable)

- **Frontend**: S3 + CloudFront
- **Backend**: EC2 / ECS / Lambda
- **Database**: RDS (PostgreSQL)
- **Email**: SES

### Environment Variables for Production

Update `.env` with production values:

```env
NODE_ENV=production
APP_URL=https://yourdomain.com

# Production Stripe keys (NOT test keys!)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Production Google Analytics
GA_MEASUREMENT_ID=G-PRODUCTION_ID

# Production database
DATABASE_URL=postgresql://prod_user:prod_password@prod_host:5432/prod_db

# Strong JWT secret (generate with: openssl rand -base64 64)
JWT_SECRET=your_super_strong_random_secret_here
```

---

## Troubleshooting

### Stripe Checkout Not Working

**Symptoms:** Error message when clicking "Upgrade"

**Solutions:**
1. Check that `STRIPE_PUBLISHABLE_KEY` is set in `.env`
2. Verify you're using the correct key (pk_test_ for testing)
3. Check browser console for errors
4. Ensure price IDs in `subscription.model.ts` match Stripe Dashboard
5. Try with test card: 4242 4242 4242 4242

### PDF Export Fails

**Symptoms:** "Failed to generate PDF" error

**Solutions:**
1. Check browser console for specific error
2. Ensure `jspdf` is installed: `npm install jspdf html2canvas`
3. Try with a simpler analysis (fewer careers)
4. Check if browser blocks downloads (popup blocker)

### Analytics Not Tracking

**Symptoms:** No data in Google Analytics Realtime report

**Solutions:**
1. Verify `GA_MEASUREMENT_ID` is set correctly (format: G-XXXXXXXXXX)
2. Check that GA script loads in browser DevTools > Network
3. Disable ad blockers
4. Wait 24-48 hours for non-realtime reports
5. Check GA4 setup vs UA (Universal Analytics deprecated)

### Email Not Sending

**Symptoms:** Emails not received

**Solutions:**
1. Check spam folder
2. Verify sender email is verified in SendGrid/Resend
3. Check backend API logs for errors
4. Test with SendGrid/Resend test tools
5. Ensure `from` email matches verified sender
6. Check rate limits (100 emails/day on free tier)

### Subscription Not Updating After Payment

**Symptoms:** User pays but still sees free tier

**Solutions:**
1. Check Stripe webhook is configured correctly
2. Verify webhook secret matches
3. Check backend logs for webhook errors
4. Test webhook in Stripe Dashboard > Webhooks > Test
5. Ensure backend updates database on `customer.subscription.created`

### App Won't Start

**Symptoms:** `npm run dev` fails

**Solutions:**
1. Delete `node_modules` and `package-lock.json`, run `npm install`
2. Check Node version: `node -v` (needs 18+)
3. Clear Angular cache: `rm -rf .angular`
4. Check for port conflicts (4200)
5. Verify all environment variables are set

---

## Next Steps After Setup

1. **Test the full user journey:**
   - Sign up → Take test → See paywall → Upgrade → Access premium features

2. **Set up monitoring:**
   - Add Sentry for error tracking
   - Set up uptime monitoring (UptimeRobot, Pingdom)
   - Monitor Stripe dashboard for failed payments

3. **Marketing:**
   - Set up SEO (meta tags, sitemap.xml, robots.txt)
   - Create content marketing strategy
   - Set up social media sharing

4. **Iterate:**
   - A/B test pricing
   - Analyze conversion funnel in Google Analytics
   - Gather user feedback
   - Add new premium features

---

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/yourusername/AIcareerfinder/issues)
- Read the [MONETIZATION_STRATEGY.md](./MONETIZATION_STRATEGY.md) for business guidance
- Contact: support@yourdomain.com

---

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Google Analytics 4 Guide](https://support.google.com/analytics/answer/10089681)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

**Ready to launch?** Follow this guide step-by-step, and you'll have a fully monetized SaaS product ready to accept payments and grow your business! 🚀
