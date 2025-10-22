import { FullAnalysis } from './personality-test.model';
import { UserSubscription } from './subscription.model';

export interface UserResult {
  id: string;
  date: string;
  archetype: string;
  analysis: FullAnalysis;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // NOTE: In a real-world app, this must be a securely stored hash, not plain text.
  results: UserResult[];
  subscription?: UserSubscription;
  testsTaken: number; // Track number of tests taken for free tier limits
  createdAt: string;
}
