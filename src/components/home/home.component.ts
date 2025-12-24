import { Component, ChangeDetectionStrategy, signal, computed, inject, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionComponent } from '../question/question.component';
import { ResultsComponent } from '../results/results.component';
import { GeminiService } from '../../services/gemini.service';
import { Question, UserAnswer, TraitScoreData, ExplainedTrait, FullAnalysis, AnswerOption } from '../../models/personality-test.model';
import { QUIZ_SCORING, QUIZ_ANIMATIONS, QUIZ_STATE } from '../../config/quiz.constants';

type AppState = 'start' | 'quiz' | 'results';

interface Archetype {
    type: string;
    name: string;
    description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, QuestionComponent, ResultsComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:beforeunload)': 'confirmExit($event)'
  }
})
export class HomeComponent implements OnDestroy {
  public geminiService = inject(GeminiService);
  
  appState = signal<AppState>('start');
  currentQuestionIndex = signal(0);
  userAnswers = signal<UserAnswer[]>([]);
  questions = signal<Question[]>([]);
  personalityProfile = signal('');
  traitScores = signal<TraitScoreData | null>(null);
  explainedTraits = signal<ExplainedTrait[]>([]);
  
  questionAnimationState = signal<'enter' | 'leave'>('enter');
  showRestartConfirmation = signal(false);
  pillarCompletionMessage = signal<string | null>(null);
  private messageTimer: ReturnType<typeof setTimeout> | null = null;

  // prettier-ignore
  private ARCHETYPES: Record<string, Archetype> = {
    // Analysts
    INTJ: { type: 'INTJ', name: 'The Architect', description: 'Imaginative and strategic thinkers, with a plan for everything. They are rational, quick-witted, and value knowledge and competence above all.' },
    INTP: { type: 'INTP', name: 'The Logician', description: 'Innovative inventors with an unquenchable thirst for knowledge. They are logical, analytical, and enjoy exploring complex theories and ideas.' },
    ENTJ: { type: 'ENTJ', name: 'The Commander', description: 'Bold, imaginative and strong-willed leaders, always finding or creating a way. They are decisive, efficient, and enjoy long-range planning and goal setting.' },
    ENTP: { type: 'ENTP', name: 'The Debater', description: 'Smart and curious thinkers who cannot resist an intellectual challenge. They are energetic, quick-witted, and enjoy debating ideas from all angles.' },
    // Diplomats
    INFJ: { type: 'INFJ', name: 'The Advocate', description: 'Quiet and mystical, yet very inspiring and tireless idealists. They are insightful, principled, and strive to have a lasting positive impact on the world.' },
    INFP: { type: 'INFP', name: 'The Mediator', description: 'Poetic, kind and altruistic people, always eager to help a good cause. They are creative, idealistic, and guided by a strong inner moral compass.' },
    ENFJ: { type: 'ENFJ', name: 'The Protagonist', description: 'Charismatic and inspiring leaders, able to mesmerize their listeners. They are passionate, altruistic, and excel at bringing people together.' },
    ENFP: { type: 'ENFP', name: 'The Campaigner', description: 'Enthusiastic, creative and sociable free spirits, who can always find a reason to smile. They are outgoing, imaginative, and see life as a grand adventure.' },
    // Sentinels
    ISTJ: { type: 'ISTJ', name: 'The Logistician', description: 'Practical and fact-minded individuals, whose reliability cannot be doubted. They are responsible, organized, and dedicated to upholding traditions and standards.' },
    ISFJ: { type: 'ISFJ', name: 'The Defender', description: 'Very dedicated and warm protectors, always ready to defend their loved ones. They are supportive, reliable, and pay close attention to practical details.' },
    ESTJ: { type: 'ESTJ', name: 'The Executive', description: 'Excellent administrators, unsurpassed at managing things or people. They are organized, efficient, and value order and structure.' },
    ESFJ: { type: 'ESFJ', name: 'The Consul', description: 'Extraordinarily caring, social and popular people, always eager to help. They are warm-hearted, conscientious, and thrive in harmonious environments.' },
    // Explorers
    ISTP: { type: 'ISTP', name: 'The Virtuoso', description: 'Bold and practical experimenters, masters of all kinds of tools. They are observant, adaptable, and enjoy hands-on problem-solving.' },
    ISFP: { type: 'ISFP', name: 'The Adventurer', description: 'Flexible and charming artists, always ready to explore and experience something new. They are spontaneous, aesthetically inclined, and live in the present moment.' },
    ESTP: { type: 'ESTP', name: 'The Entrepreneur', description: 'Smart, energetic and very perceptive people, who truly enjoy living on the edge. They are action-oriented, resourceful, and excel at navigating crises.' },
    ESFP: { type: 'ESFP', name: 'The Entertainer', description: 'Spontaneous, energetic and enthusiastic people – life is never boring around them. They are outgoing, friendly, and love to be the center of attention.' },
  };

  private questionBank: Record<string, Question[]> = {
    mind: [ // Introvert (-) vs Extrovert (+)
      { id: 1, text: 'After a social event, you feel:', type: 'multiple-choice', traitKey: 'mind', options: [
        { text: 'Drained and in need of solitude', effects: { mind: -QUIZ_SCORING.STRONG_EFFECT } },
        { text: 'A little tired, but generally content', effects: { mind: -QUIZ_SCORING.MILD_EFFECT } },
        { text: 'Energized and ready for more', effects: { mind: QUIZ_SCORING.STRONG_EFFECT } },
      ]},
      { id: 2, text: 'In a group discussion, you are more likely to:', type: 'multiple-choice', traitKey: 'mind', options: [
        { text: 'Speak up frequently with your ideas', effects: { mind: QUIZ_SCORING.MODERATE_EFFECT } },
        { text: 'Listen carefully and speak when you have a well-formed thought', effects: { mind: -QUIZ_SCORING.MODERATE_EFFECT } },
      ]},
      { id: 3, text: 'My ideal weekend involves more:', type: 'slider', traitKey: 'mind', labels: ['Quiet time for myself', 'Activities with other people'] },
    ],
    energy: [ // Observant (-) vs Intuitive (+)
      { id: 4, text: 'When learning something new, you prefer:', type: 'multiple-choice', traitKey: 'energy', options: [
        { text: 'Practical, hands-on experience', effects: { energy: -QUIZ_SCORING.STRONG_EFFECT } },
        { text: 'Exploring the underlying theories and concepts', effects: { energy: QUIZ_SCORING.STRONG_EFFECT } },
      ]},
      { id: 5, text: 'You are more interested in:', type: 'multiple-choice', traitKey: 'energy', options: [
        { text: 'The reality of how things work now', effects: { energy: -QUIZ_SCORING.MODERATE_EFFECT } },
        { text: 'The possibilities of what things could be', effects: { energy: QUIZ_SCORING.MODERATE_EFFECT } },
      ]},
      { id: 6, text: 'I tend to focus on:', type: 'slider', traitKey: 'energy', labels: ['Concrete details', 'Abstract ideas'] },
    ],
    nature: [ // Thinking (-) vs Feeling (+)
      { id: 7, text: 'When making a decision, you prioritize:', type: 'multiple-choice', traitKey: 'nature', options: [
        { text: 'Logic, efficiency, and objective truth', effects: { nature: -QUIZ_SCORING.STRONG_EFFECT } },
        { text: 'Harmony, empathy, and the impact on people', effects: { nature: QUIZ_SCORING.STRONG_EFFECT } },
      ]},
      { id: 8, text: 'When a friend is upset, your first instinct is to:', type: 'multiple-choice', traitKey: 'nature', options: [
        { text: 'Offer emotional support and understanding', effects: { nature: QUIZ_SCORING.MODERATE_EFFECT } },
        { text: 'Help them analyze the problem and find a solution', effects: { nature: -QUIZ_SCORING.MODERATE_EFFECT } },
      ]},
      { id: 9, text: 'My decision-making is guided more by:', type: 'slider', traitKey: 'nature', labels: ['My head', 'My heart'] },
    ],
    tactics: [ // Judging (-) vs Prospecting (+)
      { id: 10, text: 'When it comes to plans, you:', type: 'multiple-choice', traitKey: 'tactics', options: [
        { text: 'Prefer to have a detailed plan and stick to it', effects: { tactics: -QUIZ_SCORING.STRONG_EFFECT } },
        { text: 'See a plan as a rough guideline that can change', effects: { tactics: QUIZ_SCORING.MODERATE_EFFECT / 1.5 } },
        { text: 'Prefer to keep your options open and be spontaneous', effects: { tactics: QUIZ_SCORING.STRONG_EFFECT } },
      ]},
      { id: 11, text: 'Which word describes you better?', type: 'image-choice', traitKey: 'tactics', options: [
          { text: 'Organized', effects: { tactics: -QUIZ_SCORING.STRONG_EFFECT }, imageUrl: 'https://picsum.photos/id/183/400/300' },
          { text: 'Spontaneous', effects: { tactics: QUIZ_SCORING.STRONG_EFFECT }, imageUrl: 'https://picsum.photos/id/1015/400/300' }
      ]},
      { id: 12, text: 'I prefer my work to be:', type: 'slider', traitKey: 'tactics', labels: ['Scheduled and structured', 'Flexible and adaptable'] },
    ],
    identity: [ // Assertive (-) vs Turbulent (+)
      { id: 13, text: 'When facing a challenge, you are more likely to feel:', type: 'multiple-choice', traitKey: 'identity', options: [
        { text: 'Confident and self-assured in your abilities', effects: { identity: -QUIZ_SCORING.STRONG_EFFECT } },
        { text: 'Anxious and worried about the outcome', effects: { identity: QUIZ_SCORING.STRONG_EFFECT } },
      ]},
      { id: 14, text: 'After making a decision, you tend to:', type: 'multiple-choice', traitKey: 'identity', options: [
        { text: 'Feel confident in your choice', effects: { identity: -QUIZ_SCORING.MODERATE_EFFECT } },
        { text: 'Frequently second-guess yourself', effects: { identity: QUIZ_SCORING.MODERATE_EFFECT } },
      ]},
      { id: 15, text: 'I am generally:', type: 'slider', traitKey: 'identity', labels: ['Calm and relaxed', 'Prone to worry'] },
    ],
    qualitative: [
      { id: 16, text: 'In one sentence, describe what "a fulfilling career" means to you.', type: 'text-input', traitKey: 'qualitative_fulfillment' }
    ]
  };

  constructor() {
    this.loadProgress();
    effect(() => {
      if (this.appState() === 'quiz') this.saveProgress();
    });
  }

  ngOnDestroy(): void {
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
    }
  }

  confirmExit(event: BeforeUnloadEvent) {
    if (this.appState() === 'quiz') {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Your progress is saved.';
    }
  }

  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  progress = computed(() => {
    const questionsLength = this.questions().length;
    return questionsLength === 0 ? 0 : ((this.currentQuestionIndex()) / questionsLength) * 100;
  });
  isAnswered = computed(() => {
    const currentQ = this.currentQuestion();
    if (!currentQ) return false;
    const answer = this.userAnswers().find(a => a.questionId === currentQ.id);
    if (!answer) return false;
    if (currentQ.type === 'text-input') {
      return typeof answer.value === 'string' && answer.value.trim().length > 0;
    }
    return true;
  });
  
  startQuiz(): void {
    this.generateQuiz();
    this.appState.set('quiz');
  }
  
  private generateQuiz(): void {
    const allQuestions = Object.values(this.questionBank).flat();
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    this.questions.set(shuffled.map((q, index) => ({ ...q, id: index + 1 })));
  }

  handleAnswer(answer: UserAnswer): void {
    this.userAnswers.update(answers => {
      const existingAnswerIndex = answers.findIndex(a => a.questionId === answer.questionId);
      if (existingAnswerIndex > -1) {
        answers[existingAnswerIndex] = answer;
        return [...answers];
      }
      return [...answers, answer];
    });
  }

  nextQuestion(): void {
    this.questionAnimationState.set('leave');

    setTimeout(() => {
      if (this.currentQuestionIndex() < this.questions().length - 1) {
        const currentQ = this.currentQuestion();
        const nextQ = this.questions()[this.currentQuestionIndex() + 1];

        // Check for transition between different question pillars
        if (currentQ.traitKey !== nextQ.traitKey && this.questionBank[currentQ.traitKey]) {
            const pillarName = currentQ.traitKey.charAt(0).toUpperCase() + currentQ.traitKey.slice(1);
            this.pillarCompletionMessage.set(`${pillarName} section complete!`);
            if (this.messageTimer) {
              clearTimeout(this.messageTimer);
            }
            this.messageTimer = setTimeout(() => this.pillarCompletionMessage.set(null), QUIZ_ANIMATIONS.COMPLETION_MESSAGE_DURATION);
        }

        this.currentQuestionIndex.update(i => i + 1);
      } else {
        this.showResults();
      }
      this.questionAnimationState.set('enter');
    }, QUIZ_ANIMATIONS.TRANSITION_DURATION);
  }

  showResults(): void {
    const finalScores = this.calculateScores();
    const archetype = this.determineArchetype(finalScores);
    
    this.traitScores.set(this.buildRadarChartData(finalScores));
    this.explainedTraits.set([{ name: archetype.name, description: archetype.description }]);
    this.personalityProfile.set(this.buildPersonalityProfile(finalScores, archetype));
    
    this.appState.set('results');
    this.geminiService.getAnalysisAndSuggestions(this.personalityProfile());
    localStorage.removeItem(QUIZ_STATE.STORAGE_KEY);
  }
  
  restartTest(): void { this.showRestartConfirmation.set(true); }
  confirmRestart(): void {
    this.showRestartConfirmation.set(false);
    this.appState.set('start');
    this.currentQuestionIndex.set(0);
    this.userAnswers.set([]);
    this.questions.set([]);
    this.geminiService.state.set('idle');
    this.geminiService.analysis.set(null);
    localStorage.removeItem(QUIZ_STATE.STORAGE_KEY);
  }
  cancelRestart(): void { this.showRestartConfirmation.set(false); }

  private saveProgress(): void {
    const state = { questions: this.questions(), answers: this.userAnswers(), questionIndex: this.currentQuestionIndex() };
    localStorage.setItem(QUIZ_STATE.STORAGE_KEY, JSON.stringify(state));
  }
  private loadProgress(): void {
    const savedStateJSON = localStorage.getItem(QUIZ_STATE.STORAGE_KEY);
    if (savedStateJSON) {
      try {
        const savedState = JSON.parse(savedStateJSON);
        if (savedState.questions?.length > 0 && savedState.questionIndex < savedState.questions.length) {
          this.questions.set(savedState.questions);
          this.userAnswers.set(savedState.answers);
          this.currentQuestionIndex.set(savedState.questionIndex);
          this.appState.set('quiz');
        } else {
           localStorage.removeItem(QUIZ_STATE.STORAGE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(QUIZ_STATE.STORAGE_KEY);
      }
    }
  }

  private calculateScores(): PersonalityDimensions {
    const scores: PersonalityDimensions = { mind: 0, energy: 0, nature: 0, tactics: 0, identity: 0 };
    const maxScores: PersonalityDimensions = { mind: 0, energy: 0, nature: 0, tactics: 0, identity: 0 };

    this.questions().forEach(q => {
        // Exclude qualitative questions from scoring
        if(q.traitKey === 'qualitative_fulfillment') return;

        const answer = this.userAnswers().find(a => a.questionId === q.id);
        if (q.type === 'multiple-choice' || q.type === 'image-choice') {
            const effects = q.options?.map(o => o.effects || {}).flat();
            Object.keys(scores).forEach(dim => {
                const key = dim as keyof PersonalityDimensions;
                const maxEffect = Math.max(...effects.map(e => Math.abs(e[key] || 0)));
                maxScores[key] += maxEffect;
                if (answer) {
                    const selectedOption = q.options?.find(o => o.text === answer.value);
                    if (selectedOption?.effects?.[key]) {
                        scores[key] += selectedOption.effects[key];
                    }
                }
            });
        } else if (q.type === 'slider') {
            const key = q.traitKey as keyof PersonalityDimensions;
            maxScores[key] += QUIZ_SCORING.SLIDER_MAX_EFFECT;
            if (answer && typeof answer.value === 'number') {
                // Normalize slider 0-100 to a score from -SLIDER_MAX_EFFECT to +SLIDER_MAX_EFFECT
                scores[key] += ((answer.value - QUIZ_SCORING.SLIDER_NEUTRAL) / QUIZ_SCORING.SLIDER_NEUTRAL) * QUIZ_SCORING.SLIDER_MAX_EFFECT;
            }
        }
    });

    // Normalize final scores to be between -NORMALIZATION_RANGE and +NORMALIZATION_RANGE
    Object.keys(scores).forEach(dim => {
        const key = dim as keyof PersonalityDimensions;
        if (maxScores[key] > 0) {
            scores[key] = (scores[key] / maxScores[key]) * QUIZ_SCORING.NORMALIZATION_RANGE;
        }
    });

    return scores;
  }

  private determineArchetype(scores: PersonalityDimensions): Archetype {
    let type = '';
    type += scores.mind < 0 ? 'I' : 'E';
    type += scores.energy < 0 ? 'S' : 'N';
    type += scores.nature < 0 ? 'T' : 'F';
    type += scores.tactics < 0 ? 'J' : 'P';
    return this.ARCHETYPES[type];
  }

  private buildRadarChartData(scores: PersonalityDimensions): TraitScoreData {
      // Convert -100 to 100 score to a 0 to 100 scale for the chart
      const toPercent = (score: number) => (score + 100) / 2;
      return {
        labels: ['Extroversion', 'Intuition', 'Feeling', 'Prospecting', 'Turbulence'],
        datasets: [{
          label: 'Your Profile',
          data: [
            toPercent(scores.mind),
            toPercent(scores.energy),
            toPercent(scores.nature),
            toPercent(scores.tactics),
            toPercent(scores.identity)
          ],
          fill: true,
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: 'rgb(79, 70, 229)',
          pointBackgroundColor: 'rgb(79, 70, 229)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(79, 70, 229)'
        }]
      };
  }

  private buildPersonalityProfile(scores: PersonalityDimensions, archetype: Archetype): string {
    const toPercent = (score: number, pos: string, neg: string) => {
        const val = Math.round((score + 100) / 2);
        return score > 0 ? `${val}% ${pos}` : `${100 - val}% ${neg}`;
    };

    const profileParts = [
      `**Personality Archetype:** ${archetype.name} (${archetype.type})`,
      `**Archetype Description:** ${archetype.description}`,
      `\n**Core Trait Analysis:**`,
      `- **Mind:** ${toPercent(scores.mind, 'Extraverted', 'Introverted')}`,
      `- **Energy:** ${toPercent(scores.energy, 'Intuitive', 'Observant')}`,
      `- **Nature:** ${toPercent(scores.nature, 'Feeling', 'Thinking')}`,
      `- **Tactics:** ${toPercent(scores.tactics, 'Prospecting', 'Judging')}`,
      `- **Identity:** ${toPercent(scores.identity, 'Turbulent', 'Assertive')}`
    ];
    
    const qualitativeAnswer = this.userAnswers().find(a => a.questionId === 16);
    if(qualitativeAnswer && typeof qualitativeAnswer.value === 'string' && qualitativeAnswer.value.trim().length > 0) {
        profileParts.push(`\n**User's Definition of a Fulfilling Career:** "${qualitativeAnswer.value.trim()}"`);
    }

    return profileParts.join('\n');
  }
}

interface PersonalityDimensions {
  mind: number;       // Introvert (-) to Extrovert (+)
  energy: number;     // Observant (-) to Intuitive (+)
  nature: number;     // Thinking (-) to Feeling (+)
  tactics: number;    // Judging (-) to Prospecting (+)
  identity: number;   // Assertive (-) to Turbulent (+)
}
