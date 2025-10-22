import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionPlan } from '../../models/subscription.model';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingComponent {
  private subscriptionService = inject(SubscriptionService);
  private authService = inject(AuthService);

  billingPeriod = signal<'monthly' | 'yearly'>('monthly');
  isProcessing = signal(false);
  upgradeMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  plans = computed(() => {
    const period = this.billingPeriod();
    const allPlans = this.subscriptionService.getPlans();

    // Filter plans by billing period, excluding free plan
    const filteredPlans = allPlans.filter(
      (plan) => plan.billingPeriod === period && plan.tier !== 'free'
    );

    return filteredPlans;
  });

  featureComparison = computed(() => this.subscriptionService.getFeatureComparison());
  currentTier = computed(() => this.subscriptionService.currentTier());
  isLoggedIn = computed(() => !!this.authService.currentUser());

  setBillingPeriod(period: 'monthly' | 'yearly'): void {
    this.billingPeriod.set(period);
  }

  async selectPlan(plan: SubscriptionPlan): Promise<void> {
    if (!this.isLoggedIn()) {
      this.upgradeMessage.set({
        type: 'error',
        text: 'Please log in or create an account to upgrade',
      });
      setTimeout(() => this.upgradeMessage.set(null), 5000);
      return;
    }

    this.isProcessing.set(true);
    this.upgradeMessage.set(null);

    try {
      const result = await this.subscriptionService.upgradeSubscription(plan.id);
      this.upgradeMessage.set({
        type: result.success ? 'success' : 'error',
        text: result.message,
      });

      setTimeout(() => this.upgradeMessage.set(null), 5000);
    } catch (error) {
      this.upgradeMessage.set({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      this.isProcessing.set(false);
    }
  }

  isPlanActive(plan: SubscriptionPlan): boolean {
    return this.currentTier() === plan.tier;
  }

  getSavingsPercentage(): number {
    const monthly = this.subscriptionService.getPlans().find(p => p.id === 'premium-monthly');
    const yearly = this.subscriptionService.getPlans().find(p => p.id === 'premium-yearly');

    if (!monthly || !yearly) return 0;

    const monthlyYearlyCost = monthly.price * 12;
    const savings = ((monthlyYearlyCost - yearly.price) / monthlyYearlyCost) * 100;
    return Math.round(savings);
  }
}
