export type SubscriptionTier = 'free' | 'premium' | 'professional' | 'enterprise';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  stripePriceId?: string; // For Stripe integration
}

export interface UserSubscription {
  tier: SubscriptionTier;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface FeatureAccess {
  // Test limits
  unlimitedTests: boolean;
  maxTests: number;

  // Career suggestions
  maxCareerSuggestions: number;
  detailedCareerInfo: boolean;

  // Analysis features
  careerComparison: boolean;
  learningPaths: boolean;
  interviewPrep: boolean;
  careerSimulation: boolean;

  // Export features
  pdfExport: boolean;
  emailDelivery: boolean;

  // Premium features
  resumeBuilder: boolean;
  jobMatching: boolean;
  mentorMatching: boolean;
  progressTracking: boolean;
  skillAssessments: boolean;

  // Support
  prioritySupport: boolean;
  coachingSessions: number; // per month
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    billingPeriod: 'monthly',
    features: [
      '1 personality test',
      'Basic archetype results',
      '3 career suggestions (basic)',
      'Limited sharing',
    ],
  },
  {
    id: 'premium-monthly',
    name: 'Premium',
    tier: 'premium',
    price: 14.99,
    billingPeriod: 'monthly',
    features: [
      'Unlimited personality tests',
      'Full detailed career analysis',
      '5+ career suggestions with full details',
      'Career comparison tool',
      'Personalized learning paths',
      'Interview preparation',
      'Career simulation exercises',
      'PDF export',
      'Email delivery',
      'Priority support',
    ],
    stripePriceId: 'price_premium_monthly', // Replace with actual Stripe price ID
  },
  {
    id: 'premium-yearly',
    name: 'Premium (Yearly)',
    tier: 'premium',
    price: 149,
    billingPeriod: 'yearly',
    features: [
      'All Premium features',
      'Save 17% vs monthly',
      '2 months free',
    ],
    stripePriceId: 'price_premium_yearly',
  },
  {
    id: 'professional-monthly',
    name: 'Professional',
    tier: 'professional',
    price: 29.99,
    billingPeriod: 'monthly',
    features: [
      'Everything in Premium',
      'Skill assessment tests',
      'Job matching (Indeed, LinkedIn)',
      'Career roadmap builder',
      'Mentor matching',
      'Resume/LinkedIn optimization',
      '2 monthly coaching sessions',
      'Exclusive webinars',
      '24-hour priority support',
    ],
    stripePriceId: 'price_professional_monthly',
  },
  {
    id: 'professional-yearly',
    name: 'Professional (Yearly)',
    tier: 'professional',
    price: 299,
    billingPeriod: 'yearly',
    features: [
      'All Professional features',
      'Save 17% vs monthly',
      '2 months free',
    ],
    stripePriceId: 'price_professional_yearly',
  },
];

export const FEATURE_ACCESS: Record<SubscriptionTier, FeatureAccess> = {
  free: {
    unlimitedTests: false,
    maxTests: 1,
    maxCareerSuggestions: 3,
    detailedCareerInfo: false,
    careerComparison: false,
    learningPaths: false,
    interviewPrep: false,
    careerSimulation: false,
    pdfExport: false,
    emailDelivery: false,
    resumeBuilder: false,
    jobMatching: false,
    mentorMatching: false,
    progressTracking: false,
    skillAssessments: false,
    prioritySupport: false,
    coachingSessions: 0,
  },
  premium: {
    unlimitedTests: true,
    maxTests: -1, // unlimited
    maxCareerSuggestions: 5,
    detailedCareerInfo: true,
    careerComparison: true,
    learningPaths: true,
    interviewPrep: true,
    careerSimulation: true,
    pdfExport: true,
    emailDelivery: true,
    resumeBuilder: true,
    jobMatching: false,
    mentorMatching: false,
    progressTracking: false,
    skillAssessments: false,
    prioritySupport: true,
    coachingSessions: 1,
  },
  professional: {
    unlimitedTests: true,
    maxTests: -1,
    maxCareerSuggestions: 10,
    detailedCareerInfo: true,
    careerComparison: true,
    learningPaths: true,
    interviewPrep: true,
    careerSimulation: true,
    pdfExport: true,
    emailDelivery: true,
    resumeBuilder: true,
    jobMatching: true,
    mentorMatching: true,
    progressTracking: true,
    skillAssessments: true,
    prioritySupport: true,
    coachingSessions: 2,
  },
  enterprise: {
    unlimitedTests: true,
    maxTests: -1,
    maxCareerSuggestions: -1, // unlimited
    detailedCareerInfo: true,
    careerComparison: true,
    learningPaths: true,
    interviewPrep: true,
    careerSimulation: true,
    pdfExport: true,
    emailDelivery: true,
    resumeBuilder: true,
    jobMatching: true,
    mentorMatching: true,
    progressTracking: true,
    skillAssessments: true,
    prioritySupport: true,
    coachingSessions: -1, // unlimited
  },
};
