import { Injectable, signal } from '@angular/core';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { SubscriptionPlan } from '../models/subscription.model';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.initializeStripe();
  }

  private async initializeStripe(): Promise<void> {
    try {
      // TODO: Replace with your actual Stripe publishable key
      // Get this from: https://dashboard.stripe.com/apikeys
      const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY_HERE';

      if (publishableKey === 'pk_test_YOUR_KEY_HERE') {
        console.warn('⚠️ Stripe publishable key not set. Payment processing is disabled.');
        console.warn('Set STRIPE_PUBLISHABLE_KEY environment variable to enable Stripe.');
        return;
      }

      this.stripe = await loadStripe(publishableKey);
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      this.error.set('Failed to initialize payment system');
    }
  }

  /**
   * Create a checkout session for a subscription plan
   * In production, this should call your backend API which then calls Stripe
   */
  async createCheckoutSession(plan: SubscriptionPlan, userEmail: string): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe) {
      return { success: false, error: 'Payment system not initialized. Please check your Stripe configuration.' };
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      // TODO: In production, this should call your backend API
      // Example: const response = await fetch('/api/create-checkout-session', { ... })

      // For now, we'll show a message that this needs backend integration
      console.warn('⚠️ Checkout session creation requires backend API');
      console.warn('Create an endpoint at /api/create-checkout-session that:');
      console.warn('1. Creates a Stripe Checkout Session');
      console.warn('2. Returns the session ID');
      console.warn('3. Handles webhook events for subscription updates');

      // Mock response for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: Simulating successful checkout');
        return { success: true };
      }

      // Backend API call structure (for reference):
      /*
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          customerEmail: userEmail,
          successUrl: `${window.location.origin}/profile?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await this.stripe.redirectToCheckout({ sessionId });

      if (error) {
        return { success: false, error: error.message };
      }
      */

      return { success: false, error: 'Backend API integration required for payment processing' };
    } catch (error: any) {
      console.error('Checkout error:', error);
      return { success: false, error: error.message || 'Payment processing failed' };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Create a customer portal session for managing subscriptions
   * Allows users to update payment methods, cancel, etc.
   */
  async createPortalSession(customerId: string): Promise<{ url?: string; error?: string }> {
    if (!this.stripe) {
      return { error: 'Payment system not initialized' };
    }

    try {
      // TODO: Call your backend API
      // const response = await fetch('/api/create-portal-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ customerId }),
      // });
      // const { url } = await response.json();
      // return { url };

      return { error: 'Backend API integration required' };
    } catch (error: any) {
      console.error('Portal session error:', error);
      return { error: error.message || 'Failed to access billing portal' };
    }
  }

  /**
   * Verify if Stripe is properly configured
   */
  isConfigured(): boolean {
    return this.stripe !== null;
  }
}
