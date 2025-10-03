export type QuestionType = 'multiple-choice' | 'slider' | 'image-choice' | 'ranking' | 'rating' | 'text-input';

export interface AnswerOption {
  text: string;
  // For multiple-choice, this defines the score changes.
  effects?: { [key: string]: number };
  imageUrl?: string;
  // For ranking/rating options, this identifies what is being ranked/rated.
  trait?: string;
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options?: AnswerOption[];
  traitKey: string;
  labels?: [string, string]; // for sliders: ['Left Label', 'Right Label']
}

export interface RatingAnswer {
  trait: string;
  value: number;
}

export interface UserAnswer {
  questionId: number;
  value: number | string | string[] | RatingAnswer[];
}

export interface CareerSuggestion {
  career: string;
  description: string;
  reasoning: string;
  requiredSkills: string[];
  dayInTheLife: string;
  potentialChallenges: string[];
  growthOpportunities: string;
  suggestedFirstSteps: string[];
}

export interface PersonalityAnalysis {
  archetype: {
    name: string;
    description: string;
  };
  strengths: {
    name: string;
    description: string;
  }[];
  growthAreas: {
    name: string;
    description: string;
  }[];
}

export interface FullAnalysis extends PersonalityAnalysis {
  suggestions: CareerSuggestion[];
}

export interface TraitScoreData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    fill: boolean;
    backgroundColor: string;
    borderColor: string;
    pointBackgroundColor: string;
    pointBorderColor: string;
    pointHoverBackgroundColor: string;
    pointHoverBorderColor: string;
  }[];
}

export interface ExplainedTrait {
  name: string;
  description: string;
}

export interface CareerComparison {
  careerName: string;
  personalityFit: {
    score: number;
    explanation: string;
  };
  skillOverlap: {
    naturalSkills: string[];
    skillsToDevelop: string[];
  };
  longTermPotential: string;
  workLifeBalance: string;
}

export interface LearningStep {
  step: number;
  title: string;
  description: string;
  suggestedResource: string;
}

export interface InterviewQuestion {
  question: string;
  proTip: string;
}

export interface SimulationOption {
  text: string;
  outcome: string;
  feedback: string;
}

export interface CareerSimulation {
  scenario: string;
  options: SimulationOption[];
}
