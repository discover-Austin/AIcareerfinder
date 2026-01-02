import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { StripeService } from './stripe.service';
import { AnalyticsService } from './analytics.service';
import { UI_TIMINGS } from '../config/ui.constants';
import {
  SubscriptionTier,
  SubscriptionPlan,
  UserSubscription,
  FeatureAccess,
  SUBSCRIPTION_PLANS,
  FEATURE_ACCESS,
} from '../models/subscription.model';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private authService = inject(AuthService);
  private stripeService = inject(StripeService);
  private analyticsService = inject(AnalyticsService);

  // Computed subscription tier from current user
  currentTier = computed<SubscriptionTier>(() => {
    const user = this.authService.currentUser();
    if (!user) return 'free';
    if (!user.subscription) return 'free';
    if (user.subscription.status !== 'active' && user.subscription.status !== 'trialing') {
      return 'free';
    }
    return user.subscription.tier;
  });

  // Computed feature access based on tier
  featureAccess = computed<FeatureAccess>(() => {
    return FEATURE_ACCESS[this.currentTier()];
  });

  // Check if user has access to a specific feature
  hasAccess(feature: keyof FeatureAccess): boolean {
    const access = this.featureAccess();
    const value = access[feature];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0 || value === -1; // -1 means unlimited
    return false;
  }

  // Check if user can take another test
  canTakeTest(): { allowed: boolean; reason?: string } {
    const user = this.authService.currentUser();
    const access = this.featureAccess();

    if (access.unlimitedTests) {
      return { allowed: true };
    }

    if (!user) {
      return { allowed: true }; // Allow first test for non-logged-in users
    }

    if (user.testsTaken >= access.maxTests) {
      return {
        allowed: false,
        reason: `You've reached your limit of ${access.maxTests} test(s). Upgrade to Premium for unlimited tests!`,
      };
    }

    return { allowed: true };
  }

  // Check if user can access detailed career info
  canAccessCareerDetails(careerIndex: number): { allowed: boolean; reason?: string } {
    const access = this.featureAccess();

    if (!access.detailedCareerInfo) {
      return {
        allowed: false,
        reason: 'Upgrade to Premium to access detailed career information, day-in-the-life scenarios, and personalized insights!',
      };
    }

    return { allowed: true };
  }

  // Get all subscription plans
  getPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  // Get plans by billing period
  getPlansByBillingPeriod(period: 'monthly' | 'yearly'): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS.filter((plan) => plan.billingPeriod === period);
  }

  // Get current subscription info
  getCurrentSubscription(): UserSubscription | null {
    const user = this.authService.currentUser();
    return user?.subscription || null;
  }

  // Calculate days until subscription ends
  getDaysUntilRenewal(): number | null {
    const subscription = this.getCurrentSubscription();
    if (!subscription) return null;

    const endDate = new Date(subscription.currentPeriodEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  // Upgrade subscription using Stripe
  async upgradeSubscription(planId: string): Promise<{ success: boolean; message: string }> {
    const user = this.authService.currentUser();
    if (!user) {
      return { success: false, message: 'Please log in to upgrade' };
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return { success: false, message: 'Invalid plan selected' };
    }

    // Track upgrade initiation
    this.analyticsService.trackUpgradeInitiated(plan.name, plan.price);

    // Check if Stripe is configured
    if (!this.stripeService.isConfigured()) {
      console.warn('Stripe not configured, using mock upgrade');
      // Fallback to mock for development
      return this.mockUpgrade(plan);
    }

    // Use Stripe for real payment processing
    const result = await this.stripeService.createCheckoutSession(plan, user.email);

    if (result.success) {
      this.analyticsService.trackUpgradeCompleted(plan.name, plan.price);

      // Note: In production, subscription will be created via webhook
      // after successful payment, not here
      return {
        success: true,
        message: `Redirecting to secure checkout...`,
      };
    }

    return {
      success: false,
      message: result.error || 'Failed to initiate checkout',
    };
  }

  // Mock upgrade for development (when Stripe is not configured)
  private mockUpgrade(plan: SubscriptionPlan): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.authService.currentUser();
        if (!user) {
          resolve({ success: false, message: 'Please log in to upgrade' });
          return;
        }

        // Create subscription
        const newSubscription: UserSubscription = {
          tier: plan.tier,
          planId: plan.id,
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(
            Date.now() + (plan.billingPeriod === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
          ).toISOString(),
          cancelAtPeriodEnd: false,
        };

        this.authService.updateUserSubscription(newSubscription);
        this.analyticsService.trackUpgradeCompleted(plan.name, plan.price);
        this.analyticsService.setUserSubscriptionTier(plan.tier);

        resolve({ success: true, message: `Successfully upgraded to ${plan.name}!` });
      }, UI_TIMINGS.MOCK_API_DELAY);
    });
  }

  // Cancel subscription
  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    const user = this.authService.currentUser();
    const subscription = user?.subscription;

    if (!subscription) {
      return { success: false, message: 'No active subscription found' };
    }

    // Track cancellation
    this.analyticsService.trackSubscriptionCanceled(subscription.planId);

    // TODO: In production, call backend API to cancel Stripe subscription
    // For now, just update local state
    subscription.cancelAtPeriodEnd = true;
    this.authService.updateUserSubscription(subscription);

    return {
      success: true,
      message: `Your subscription will remain active until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`,
    };
  }

  // Mock: Reactivate canceled subscription
  reactivateSubscription(): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.authService.currentUser();
        const subscription = user?.subscription;

        if (!subscription) {
          resolve({ success: false, message: 'No subscription found' });
          return;
        }

        subscription.cancelAtPeriodEnd = false;
        this.authService.updateUserSubscription(subscription);

        resolve({ success: true, message: 'Subscription reactivated successfully!' });
      }, UI_TIMINGS.MOCK_API_DELAY);
    });
  }

  // Get feature comparison for pricing page
  getFeatureComparison(): {
    feature: string;
    free: boolean | string;
    premium: boolean | string;
    professional: boolean | string;
  }[] {
    return [
      {
        feature: 'Personality Tests',
        free: '1 test',
        premium: 'Unlimited',
        professional: 'Unlimited',
      },
      {
        feature: 'Career Suggestions',
        free: '3 basic',
        premium: '5+ detailed',
        professional: '10+ detailed',
      },
      {
        feature: 'Detailed Career Analysis',
        free: false,
        premium: true,
        professional: true,
      },
      {
        feature: 'Career Comparison Tool',
        free: false,
        premium: true,
        professional: true,
      },
      {
        feature: 'Learning Paths',
        free: false,
        premium: true,
        professional: true,
      },
      {
        feature: 'Interview Preparation',
        free: false,
        premium: true,
        professional: true,
      },
      {
        feature: 'Career Simulations',
        free: false,
        premium: true,
        professional: true,
      },
      {
        feature: 'PDF Export',
        free: false,
        premium: true,
        professional: true,
      },
      {
        feature: 'Email Delivery',
        free: false,
        premium: true,
        professional: true,
      },
      {
        feature: 'Resume Builder',
        free: false,
        premium: true,
        professional: true,
      },
      {
        feature: 'Job Matching',
        free: false,
        premium: false,
        professional: true,
      },
      {
        feature: 'Mentor Matching',
        free: false,
        premium: false,
        professional: true,
      },
      {
        feature: 'Skill Assessments',
        free: false,
        premium: false,
        professional: true,
      },
      {
        feature: 'Progress Tracking',
        free: false,
        premium: false,
        professional: true,
      },
      {
        feature: 'Coaching Sessions/month',
        free: '0',
        premium: '1 session',
        professional: '2 sessions',
      },
      {
        feature: 'Support',
        free: 'Community',
        premium: 'Priority',
        professional: '24-hour priority',
      },
    ];
  }
}
