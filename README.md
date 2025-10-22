# AI Career Path Finder

An AI-powered personality assessment and career guidance platform that helps users discover their ideal career paths based on their unique personality traits.

## Overview

AI Career Path Finder combines comprehensive personality testing (based on MBTI framework) with advanced AI analysis to provide personalized career recommendations, learning paths, and actionable insights.

## Features

### Core Functionality
- **Personality Assessment**: Comprehensive test covering 5 key dimensions (Mind, Energy, Nature, Tactics, Identity)
- **16 Personality Archetypes**: Based on Myers-Briggs Type Indicator framework
- **AI-Powered Analysis**: Powered by Google's Gemini AI for detailed insights
- **Career Recommendations**: Personalized career suggestions with detailed explanations

### Premium Features
- **Detailed Career Analysis**: In-depth day-in-the-life scenarios, required skills, and growth opportunities
- **Career Comparison Tool**: Compare up to 3 careers side-by-side
- **Personalized Learning Paths**: Step-by-step guidance with curated resources
- **Interview Preparation**: Personality-specific interview questions and expert tips
- **Career Simulations**: Interactive workplace scenarios with personalized feedback
- **PDF Export**: Professional reports of your complete career analysis
- **Unlimited Tests**: Take as many personality tests as you need

## Monetization Model

### Pricing Tiers

#### Free Tier
- 1 personality test (lifetime)
- Basic archetype results
- 3 career suggestions (basic info only)

#### Premium - $14.99/month or $149/year
- Unlimited personality tests
- Full detailed career analysis
- 5+ career suggestions with complete details
- Career comparison tool
- Personalized learning paths
- Interview preparation
- Career simulation exercises
- PDF export & email delivery
- Priority support

#### Professional - $29.99/month or $299/year
- Everything in Premium
- Skill assessment tests
- Job matching (Indeed, LinkedIn integration)
- Career roadmap builder
- Mentor matching
- Resume/LinkedIn optimization
- 2 monthly coaching sessions
- 24-hour priority support

See [MONETIZATION_STRATEGY.md](./MONETIZATION_STRATEGY.md) for the complete monetization strategy and roadmap.

## Technology Stack

- **Frontend**: Angular 20.3, TypeScript 5.8
- **Styling**: Tailwind CSS
- **AI**: Google Gemini AI (@google/genai)
- **Charts**: Custom Radar Chart component
- **State Management**: Angular Signals
- **Routing**: Angular Router
- **Authentication**: Local storage (development)
  - *Note: In production, this should be replaced with a secure backend solution*

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AIcareerfinder.git
cd AIcareerfinder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file (or set environment variable)
echo "API_KEY=your_gemini_api_key_here" > .env
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:4200`

## Project Structure

```
AIcareerfinder/
├── src/
│   ├── components/
│   │   ├── about/              # About page
│   │   ├── header/             # Header component
│   │   ├── home/               # Main quiz component
│   │   ├── login/              # Login/Register
│   │   ├── paywall-modal/      # Upgrade prompts
│   │   ├── pricing/            # Pricing page
│   │   ├── profile/            # User profile
│   │   ├── question/           # Question component
│   │   ├── radar-chart/        # Personality visualization
│   │   └── results/            # Results & recommendations
│   ├── models/
│   │   ├── personality-test.model.ts
│   │   ├── subscription.model.ts
│   │   └── user.model.ts
│   ├── services/
│   │   ├── auth.service.ts     # Authentication
│   │   ├── gemini.service.ts   # AI integration
│   │   ├── subscription.service.ts  # Subscription management
│   │   └── theme.service.ts    # Theme switching
│   ├── guards/
│   │   └── auth.guard.ts       # Route protection
│   └── app.routes.ts           # Application routes
├── MONETIZATION_STRATEGY.md   # Detailed monetization plan
└── README.md
```

## Key Components

### Home Component
- Manages quiz flow and state
- Handles question progression
- Calculates personality scores
- Determines personality archetype

### Results Component
- Displays personality analysis
- Shows career recommendations
- Provides interactive features (comparisons, learning paths, etc.)
- Implements feature gating for premium features

### Subscription Service
- Manages subscription tiers
- Controls feature access
- Handles upgrade/downgrade logic

### Pricing Component
- Displays pricing plans
- Feature comparison table
- Subscription management

## Personality Dimensions

The test analyzes five key dimensions:

1. **Mind**: Introversion ↔ Extraversion
2. **Energy**: Observant ↔ Intuitive
3. **Nature**: Thinking ↔ Feeling
4. **Tactics**: Judging ↔ Prospecting
5. **Identity**: Assertive ↔ Turbulent

## Roadmap

### Phase 1 (Current) - MVP
- [x] Core personality test
- [x] AI-powered career suggestions
- [x] Freemium model with paywalls
- [x] Pricing page
- [ ] Stripe payment integration
- [ ] PDF export functionality

### Phase 2 - Enhancement
- [ ] Backend API (Node.js/Python)
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real authentication system
- [ ] Resume builder
- [ ] Email delivery system

### Phase 3 - Growth
- [ ] Job board integration
- [ ] Mentor matching platform
- [ ] Mobile app (iOS/Android)
- [ ] Company culture matching
- [ ] API for third-party integrations

## Environment Variables

```bash
API_KEY=your_gemini_api_key        # Google Gemini AI API key
```

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Important Notes

### Security Considerations
- **Current auth is NOT production-ready**: Passwords are stored in plain text in localStorage
- For production, implement:
  - Backend API with secure authentication (JWT, OAuth)
  - Password hashing (bcrypt, Argon2)
  - HTTPS only
  - Secure session management
  - CSRF protection

### API Cost Management
- Implement rate limiting on Gemini AI calls
- Cache common results
- Monitor API usage
- Set up usage alerts

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue on GitHub.

## Acknowledgments

- Personality framework inspired by Myers-Briggs Type Indicator (MBTI)
- AI analysis powered by Google Gemini
- UI components built with Tailwind CSS

---

**Note**: This is a development version. Before deploying to production, ensure you implement proper backend infrastructure, security measures, and payment processing.
