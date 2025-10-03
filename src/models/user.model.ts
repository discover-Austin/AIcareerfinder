import { FullAnalysis } from './personality-test.model';

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
}
