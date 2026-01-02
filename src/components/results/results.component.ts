import { Component, ChangeDetectionStrategy, input, output, computed, signal, effect, untracked, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CareerSuggestion, ExplainedTrait, TraitScoreData, FullAnalysis, CareerComparison, LearningStep, InterviewQuestion, CareerSimulation, SimulationOption } from '../../models/personality-test.model';
import { GeminiState, GeminiService } from '../../services/gemini.service';
import { AuthService } from '../../services/auth.service';
import { SubscriptionService } from '../../services/subscription.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { AnalyticsService } from '../../services/analytics.service';
import { RadarChartComponent } from '../radar-chart/radar-chart.component';
import { PaywallModalComponent } from '../paywall-modal/paywall-modal.component';
import { UI_TIMINGS, UI_LIMITS } from '../../config/ui.constants';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, RadarChartComponent, RouterLink, PaywallModalComponent],
  templateUrl: './results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsComponent implements OnDestroy {
  analysis = input.required<FullAnalysis | null>();
  state = input.required<GeminiState>();
  personalityProfile = input.required<string>();
  traitScores = input.required<TraitScoreData | null>();
  explainedTraits = input.required<ExplainedTrait[]>();
  restart = output<void>();

  private authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  private pdfExportService = inject(PdfExportService);
  private analyticsService = inject(AnalyticsService);
  geminiService = inject(GeminiService);

  selectedCareer = signal<CareerSuggestion | null>(null);
  resultSaved = signal(false);

  // Paywall state
  showPaywall = signal(false);
  paywallTitle = signal('Upgrade to Premium');
  paywallMessage = signal('This feature is available for Premium subscribers.');

  // Comparison State
  careersToCompare = signal<CareerSuggestion[]>([]);
  showComparisonModal = signal(false);
  comparisonData = signal<CareerComparison[] | null>(null);
  comparisonState = signal<'idle'|'loading'|'success'|'error'>('idle');

  // Testimonial State
  testimonials = signal<Map<string, { state: 'loading'|'success'|'error', content: string }>>(new Map());

  // New Features State
  learningPath = signal<{ state: 'idle'|'loading'|'success'|'error', data: LearningStep[] | null }>({ state: 'idle', data: null });
  interviewQuestions = signal<{ state: 'idle'|'loading'|'success'|'error', data: InterviewQuestion[] | null }>({ state: 'idle', data: null });
  careerSimulation = signal<{ state: 'idle'|'loading'|'success'|'error', data: CareerSimulation | null }>({ state: 'idle', data: null });
  selectedSimulationOption = signal<SimulationOption | null>(null);

  isLoading = computed(() => this.state() === 'loading');
  isSuccess = computed(() => this.state() === 'success' && this.analysis() !== null);
  isError = computed(() => this.state() === 'error');
  isLoggedIn = computed(() => !!this.authService.currentUser());

  // Subscription access
  hasDetailedAccess = computed(() => this.subscriptionService.hasAccess('detailedCareerInfo'));
  hasComparisonAccess = computed(() => this.subscriptionService.hasAccess('careerComparison'));
  hasLearningPathAccess = computed(() => this.subscriptionService.hasAccess('learningPaths'));
  hasInterviewPrepAccess = computed(() => this.subscriptionService.hasAccess('interviewPrep'));
  hasSimulationAccess = computed(() => this.subscriptionService.hasAccess('careerSimulation'));
  hasPdfExportAccess = computed(() => this.subscriptionService.hasAccess('pdfExport'));
  currentTier = computed(() => this.subscriptionService.currentTier());

  // Limit career suggestions based on tier
  displayedCareerSuggestions = computed(() => {
    const analysis = this.analysis();
    if (!analysis) return [];
    const maxSuggestions = this.subscriptionService.featureAccess().maxCareerSuggestions;
    if (maxSuggestions === -1) return analysis.suggestions;
    return analysis.suggestions.slice(0, maxSuggestions);
  });

  // Enhanced loading state
  private loadingMessages = [
    'Calibrating your cognitive profile...',
    'Assessing interpersonal dynamics...',
    'Synthesizing your work ethic...',
    'Evaluating emotional responses...',
    'Aligning with your core values...',
    'Crafting your unique archetype...'
  ];
  currentLoadingMessage = signal(this.loadingMessages[0]);
  private loadingInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect((onCleanup) => {
      if (this.isLoading()) {
        let i = 0;
        this.currentLoadingMessage.set(this.loadingMessages[i]);
        this.loadingInterval = setInterval(() => {
          i = (i + 1) % this.loadingMessages.length;
          this.currentLoadingMessage.set(this.loadingMessages[i]);
        }, UI_TIMINGS.LOADING_MESSAGES_INTERVAL);
      } else {
        if (this.loadingInterval) {
          clearInterval(this.loadingInterval);
        }
      }

      // Auto-save result for logged-in user
      if (this.isSuccess() && this.isLoggedIn()) {
        untracked(() => {
            this.saveResultToProfile();
        });
      }

      onCleanup(() => {
        if (this.loadingInterval) {
          clearInterval(this.loadingInterval);
        }
      });
    });
  }

  private saveResultToProfile(): void {
    if (this.resultSaved() || !this.analysis()) return;
    this.authService.saveResult(this.analysis()!);
    this.resultSaved.set(true);
  }

  onRestart(): void {
    this.restart.emit();
  }

  viewCareerDetails(suggestion: CareerSuggestion): void {
    // Check if user has access to detailed career info
    if (!this.hasDetailedAccess()) {
      this.paywallTitle.set('Unlock Detailed Career Insights');
      this.paywallMessage.set('Get full access to day-in-the-life scenarios, required skills, growth opportunities, and personalized insights.');
      this.showPaywall.set(true);
      return;
    }

    this.selectedCareer.set(suggestion);
    // Reset new feature states
    this.learningPath.set({ state: 'idle', data: null });
    this.interviewQuestions.set({ state: 'idle', data: null });
    this.careerSimulation.set({ state: 'idle', data: null });
    this.selectedSimulationOption.set(null);

    const careerName = suggestion.career;
    // Fetch testimonial if not already fetched
    if (!this.testimonials().has(careerName)) {
      this.testimonials.update(m => new Map(m.set(careerName, { state: 'loading', content: '' })));
      this.geminiService.getCareerTestimonial(this.analysis()!.archetype.name, careerName)
        .then(content => {
          if (content) {
            this.testimonials.update(m => new Map(m.set(careerName, { state: 'success', content })));
          } else {
            this.testimonials.update(m => new Map(m.set(careerName, { state: 'error', content: 'Could not load testimonial at this time.' })));
          }
        });
    }
  }

  closeCareerDetails(): void {
    this.selectedCareer.set(null);
  }

  toggleCompare(career: CareerSuggestion, event: Event): void {
    event.stopPropagation();
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
        if (this.careersToCompare().length < UI_LIMITS.MAX_CAREERS_TO_COMPARE) {
            this.careersToCompare.update(careers => [...careers, career]);
        } else {
            (event.target as HTMLInputElement).checked = false; // Prevent checking more than limit
        }
    } else {
        this.careersToCompare.update(careers => careers.filter(c => c.career !== career.career));
    }
  }

  async startComparison(): Promise<void> {
    if (!this.hasComparisonAccess()) {
      this.paywallTitle.set('Unlock Career Comparison');
      this.paywallMessage.set('Compare careers side-by-side to find the perfect fit for your personality.');
      this.showPaywall.set(true);
      return;
    }

    if (this.careersToCompare().length < 2) return;
    this.showComparisonModal.set(true);
    this.comparisonState.set('loading');
    const result = await this.geminiService.getCareerComparison(this.personalityProfile(), this.careersToCompare());
    if (result) {
        this.comparisonData.set(result);
        this.comparisonState.set('success');
    } else {
        this.comparisonState.set('error');
    }
  }

  closeComparisonModal(): void {
    this.showComparisonModal.set(false);
    this.comparisonData.set(null);
    this.comparisonState.set('idle');
  }

  shareOnTwitter(): void {
    const archetype = this.analysis()?.archetype?.name || 'a unique profile';
    const text = `I took the AI Career Path Finder and discovered my personality archetype is "${archetype}". Find your perfect career!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  shareOnLinkedIn(): void {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async generateLearningPath(): Promise<void> {
    if (!this.hasLearningPathAccess()) {
      this.paywallTitle.set('Unlock Personalized Learning Paths');
      this.paywallMessage.set('Get step-by-step guidance with curated resources to develop the skills you need.');
      this.showPaywall.set(true);
      return;
    }

    if (!this.selectedCareer() || !this.analysis()) return;
    this.learningPath.set({ state: 'loading', data: null });

    const career = this.selectedCareer()!;
    const skillsToDevelop = career.potentialChallenges.map(challenge => `Overcoming: ${challenge}`).concat(career.requiredSkills);

    const result = await this.geminiService.getLearningPath(
      this.analysis()!.archetype.name,
      career.career,
      skillsToDevelop
    );

    if (result) {
      this.learningPath.set({ state: 'success', data: result });
    } else {
      this.learningPath.set({ state: 'error', data: null });
    }
  }

  async generateInterviewQuestions(): Promise<void> {
    if (!this.hasInterviewPrepAccess()) {
      this.paywallTitle.set('Unlock Interview Preparation');
      this.paywallMessage.set('Get personality-specific interview questions and expert tips to ace your interviews.');
      this.showPaywall.set(true);
      return;
    }

    if (!this.selectedCareer() || !this.analysis()) return;
    this.interviewQuestions.set({ state: 'loading', data: null });

    const result = await this.geminiService.getInterviewQuestions(
      this.analysis()!.archetype.name,
      this.selectedCareer()!.career,
      this.analysis()!.growthAreas
    );

    if (result) {
      this.interviewQuestions.set({ state: 'success', data: result });
    } else {
      this.interviewQuestions.set({ state: 'error', data: null });
    }
  }

  async generateCareerSimulation(): Promise<void> {
    if (!this.hasSimulationAccess()) {
      this.paywallTitle.set('Unlock Career Simulations');
      this.paywallMessage.set('Experience realistic workplace scenarios and get personalized feedback on your decisions.');
      this.showPaywall.set(true);
      return;
    }

    if (!this.selectedCareer() || !this.analysis()) return;
    this.careerSimulation.set({ state: 'loading', data: null });
    this.selectedSimulationOption.set(null);

    const result = await this.geminiService.getCareerSimulation(
      this.analysis()!.archetype.name,
      this.selectedCareer()!.career,
      this.analysis()!.growthAreas
    );

    if (result) {
      this.careerSimulation.set({ state: 'success', data: result });
    } else {
      this.careerSimulation.set({ state: 'error', data: null });
    }
  }

  selectSimulationOption(option: SimulationOption): void {
    this.selectedSimulationOption.set(option);
  }

  closePaywall(): void {
    this.showPaywall.set(false);
  }

  async exportToPDF(): Promise<void> {
    if (!this.hasPdfExportAccess()) {
      this.analyticsService.trackPaywallShown('pdf_export');
      this.paywallTitle.set('Unlock PDF Export');
      this.paywallMessage.set('Download a professional PDF report of your complete career analysis.');
      this.showPaywall.set(true);
      return;
    }

    const analysis = this.analysis();
    const profile = this.personalityProfile();
    const user = this.authService.currentUser();

    if (!analysis) {
      alert('No analysis available to export');
      return;
    }

    try {
      this.analyticsService.trackPDFExport();
      await this.pdfExportService.exportAnalysisToPDF(
        analysis,
        profile,
        user?.name
      );
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }

  ngOnDestroy(): void {
    if (this.loadingInterval) {
      clearInterval(this.loadingInterval);
    }
  }
}
