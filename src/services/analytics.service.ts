import { Injectable } from '@angular/core';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private initialized = false;

  constructor() {
    this.initializeGoogleAnalytics();
  }

  private initializeGoogleAnalytics(): void {
    // TODO: Replace with your Google Analytics Measurement ID
    // Get this from: https://analytics.google.com/
    const measurementId = process.env.GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

    if (measurementId === 'G-XXXXXXXXXX') {
      console.warn('⚠️ Google Analytics not configured. Set GA_MEASUREMENT_ID environment variable.');
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer!.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false, // We'll track page views manually
    });

    this.initialized = true;
    console.log('✅ Google Analytics initialized');
  }

  /**
   * Track page view
   */
  trackPageView(pagePath: string, pageTitle?: string): void {
    if (!this.initialized || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, eventParams?: Record<string, any>): void {
    if (!this.initialized || !window.gtag) return;

    window.gtag('event', eventName, eventParams);
  }

  /**
   * Track quiz events
   */
  trackQuizStarted(): void {
    this.trackEvent('quiz_started', {
      event_category: 'engagement',
    });
  }

  trackQuizCompleted(archetype: string): void {
    this.trackEvent('quiz_completed', {
      event_category: 'engagement',
      archetype: archetype,
    });
  }

  trackQuestionAnswered(questionNumber: number, totalQuestions: number): void {
    this.trackEvent('question_answered', {
      event_category: 'engagement',
      question_number: questionNumber,
      total_questions: totalQuestions,
      progress_percentage: Math.round((questionNumber / totalQuestions) * 100),
    });
  }

  /**
   * Track conversion events
   */
  trackSignup(method: 'email' | 'google' | 'other'): void {
    this.trackEvent('sign_up', {
      method: method,
    });
  }

  trackUpgradeInitiated(plan: string, price: number): void {
    this.trackEvent('begin_checkout', {
      event_category: 'conversion',
      items: [{
        item_name: plan,
        price: price,
      }],
    });
  }

  trackUpgradeCompleted(plan: string, price: number): void {
    this.trackEvent('purchase', {
      event_category: 'conversion',
      transaction_id: crypto.randomUUID(),
      value: price,
      currency: 'USD',
      items: [{
        item_name: plan,
        price: price,
      }],
    });
  }

  trackSubscriptionCanceled(plan: string): void {
    this.trackEvent('subscription_canceled', {
      event_category: 'conversion',
      plan: plan,
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsed(featureName: string, additionalParams?: Record<string, any>): void {
    this.trackEvent('feature_used', {
      event_category: 'engagement',
      feature_name: featureName,
      ...additionalParams,
    });
  }

  trackCareerDetailsViewed(careerName: string): void {
    this.trackEvent('career_details_viewed', {
      event_category: 'engagement',
      career_name: careerName,
    });
  }

  trackCareerComparison(careers: string[]): void {
    this.trackEvent('career_comparison', {
      event_category: 'engagement',
      careers_compared: careers.join(', '),
      number_of_careers: careers.length,
    });
  }

  trackPDFExport(): void {
    this.trackEvent('pdf_export', {
      event_category: 'engagement',
    });
  }

  /**
   * Track paywall interactions
   */
  trackPaywallShown(feature: string): void {
    this.trackEvent('paywall_shown', {
      event_category: 'conversion',
      feature: feature,
    });
  }

  trackPaywallDismissed(feature: string): void {
    this.trackEvent('paywall_dismissed', {
      event_category: 'conversion',
      feature: feature,
    });
  }

  trackPaywallUpgradeClicked(feature: string): void {
    this.trackEvent('paywall_upgrade_clicked', {
      event_category: 'conversion',
      feature: feature,
    });
  }

  /**
   * Track social sharing
   */
  trackSocialShare(platform: 'twitter' | 'linkedin' | 'other'): void {
    this.trackEvent('share', {
      event_category: 'engagement',
      method: platform,
    });
  }

  /**
   * Set user properties
   */
  setUserProperty(propertyName: string, value: any): void {
    if (!this.initialized || !window.gtag) return;

    window.gtag('set', 'user_properties', {
      [propertyName]: value,
    });
  }

  setUserSubscriptionTier(tier: string): void {
    this.setUserProperty('subscription_tier', tier);
  }

  setUserArchetype(archetype: string): void {
    this.setUserProperty('personality_archetype', archetype);
  }
}
