import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { FullAnalysis, CareerSuggestion, CareerComparison, LearningStep, InterviewQuestion, CareerSimulation } from '../models/personality-test.model';

export type GeminiState = 'idle' | 'loading' | 'success' | 'error';

/**
 * ⚠️ SECURITY WARNING - NOT PRODUCTION READY ⚠️
 *
 * CRITICAL ISSUES:
 * 1. API KEY EXPOSED IN FRONTEND CODE
 *    - Environment variables in frontend builds are PUBLIC
 *    - Anyone can extract the API key from the bundled JavaScript
 *    - API key can be used to make unauthorized requests
 *    - Could lead to unexpected charges on your API account
 *
 * 2. NO RATE LIMITING
 *    - No protection against API abuse
 *    - No request throttling
 *
 * 3. NO ERROR RETRY LOGIC
 *    - Transient failures not handled
 *    - Poor user experience
 *
 * FOR PRODUCTION, YOU MUST:
 * - Move ALL API calls to a backend server
 * - Store API keys server-side only (never in frontend)
 * - Implement backend API endpoints that call Gemini
 * - Add authentication to backend endpoints
 * - Implement rate limiting (per user/IP)
 * - Add request validation and sanitization
 * - Implement retry logic with exponential backoff
 * - Add request logging and monitoring
 * - Set up API usage alerts
 *
 * RECOMMENDED ARCHITECTURE:
 * Frontend -> Your Backend API (with auth) -> Gemini API (with server-side key)
 *
 * This implementation is ONLY suitable for local development and testing.
 */
@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;
  public state = signal<GeminiState>('idle');
  public analysis = signal<FullAnalysis | null>(null);

  constructor() {
    // ⚠️ CRITICAL SECURITY ISSUE:
    // Environment variables in FRONTEND builds are PUBLICLY ACCESSIBLE
    // Anyone can extract this API key from the bundled JavaScript
    // FOR PRODUCTION: Move API calls to backend server with server-side API key
    if (!process.env.API_KEY) {
      console.error('API_KEY environment variable not set.');
      this.state.set('error');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  }

  async getAnalysisAndSuggestions(personalityProfile: string): Promise<void> {
    this.state.set('loading');
    this.analysis.set(null);

    const prompt = `
      You are an expert career counselor and personality analyst, specializing in frameworks similar to the Myers-Briggs Type Indicator (MBTI).
      A user has completed a comprehensive personality assessment. Their detailed profile is as follows:

      ${personalityProfile}

      Based *only* on the provided personality profile, perform a comprehensive analysis. Please provide the following in a structured JSON format:

      1.  **Personality Archetype**: Use the exact archetype name and description provided in the profile. Do not invent a new one.
      2.  **Strengths**: Identify 3 key strengths that are hallmarks of this specific personality archetype. For each, provide a name and a brief, insightful description of how this strength manifests professionally.
      3.  **Growth Areas**: Identify 2-3 potential areas for growth that are common challenges for this archetype. Frame these constructively as opportunities for development. For each, provide a name and a brief description.
      4.  **Career Suggestions**: Suggest FIVE distinct and well-suited career paths. For each career, you MUST provide:
          a. The career title.
          b. A concise one-paragraph description of the career.
          c. A brief but specific explanation for why it aligns with the user's personality profile, referencing their core traits (e.g., "Your combination of Introversion and Intuition makes you ideal for...").
          d. A list of 3-5 key skills required for this career.
          e. A detailed "Day-in-the-Life" narrative. This should be a multi-paragraph, engaging story that walks the user through a typical workday from morning to evening, highlighting key tasks, interactions, and the general atmosphere of the job, all tailored to their personality type.
          f. A list of 2-3 "Potential Challenges" the user might face in this role, specifically based on their archetype's potential weaknesses.
          g. A "Growth Opportunities" paragraph describing the long-term prospects or advancement paths in this field.
          h. A list of 3 actionable "Suggested First Steps" someone with this profile can take to explore this career.
    `;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              archetype: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "description"]
              },
              strengths: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["name", "description"]
                }
              },
              growthAreas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["name", "description"]
                }
              },
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    career: { type: Type.STRING },
                    description: { type: Type.STRING },
                    reasoning: { type: Type.STRING },
                    requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    dayInTheLife: { type: Type.STRING },
                    potentialChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
                    growthOpportunities: { type: Type.STRING },
                    suggestedFirstSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["career", "description", "reasoning", "requiredSkills", "dayInTheLife", "potentialChallenges", "growthOpportunities", "suggestedFirstSteps"]
                }
              }
            },
            required: ["archetype", "strengths", "growthAreas", "suggestions"]
          },
        },
      });

      const jsonString = response.text.trim();
      const fullAnalysis = JSON.parse(jsonString);
      this.analysis.set(fullAnalysis);
      this.state.set('success');
    } catch (error) {
      console.error('Error fetching analysis from Gemini API:', error);
      this.state.set('error');
    }
  }

  async getCareerComparison(personalityProfile: string, careers: CareerSuggestion[]): Promise<CareerComparison[] | null> {
    const careerTitles = careers.map(c => c.career).join(', ');
    const prompt = `
      You are a comparative career analyst AI. A user with the following personality profile wants to compare these careers: ${careerTitles}.

      User Profile:
      ${personalityProfile}

      For each career, provide a comparative analysis on the following dimensions, focusing on how they relate to the user's profile. Return the response as a valid JSON array.

      1.  **Personality Fit**: A score from 1 to 10 on how well the career aligns with their archetype and traits, and a brief explanation for the score.
      2.  **Skill Overlap**: A list of skills they might naturally possess that are valuable for this role, and a list of key skills they would need to develop.
      3.  **Long-Term Potential**: A concise summary of growth opportunities and career advancement paths.
      4.  **Work-Life Balance**: A realistic, qualitative description of the typical work-life balance in this field.
    `;

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            careerName: { type: Type.STRING },
                            personalityFit: {
                                type: Type.OBJECT,
                                properties: {
                                    score: { type: Type.INTEGER, description: "Score from 1 to 10" },
                                    explanation: { type: Type.STRING }
                                },
                                required: ["score", "explanation"]
                            },
                            skillOverlap: {
                                type: Type.OBJECT,
                                properties: {
                                    naturalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    skillsToDevelop: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["naturalSkills", "skillsToDevelop"]
                            },
                            longTermPotential: { type: Type.STRING },
                            workLifeBalance: { type: Type.STRING }
                        },
                        required: ["careerName", "personalityFit", "skillOverlap", "longTermPotential", "workLifeBalance"]
                    }
                }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as CareerComparison[];
    } catch (error) {
        console.error('Error fetching career comparison from Gemini API:', error);
        return null;
    }
  }

  async getCareerTestimonial(archetypeName: string, careerName: string): Promise<string | null> {
      const prompt = `
        You are a creative writer. Write a short, inspiring, first-person testimonial (around 100-120 words) from the perspective of a person with the "${archetypeName}" personality archetype who is happy and successful working as a "${careerName}".
        The tone should be authentic, encouraging, and reflect the core traits of the archetype. It should touch upon why the career is a good fit for their personality, perhaps mentioning how they overcame a typical challenge for their type in this role. Do not use quotation marks around the entire text.
      `;
      try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
      } catch (error) {
        console.error('Error fetching testimonial from Gemini API:', error);
        return null;
      }
  }

  async getLearningPath(archetypeName: string, careerName: string, skillsToDevelop: string[]): Promise<LearningStep[] | null> {
    const prompt = `
      You are an expert career development coach. A user with the "${archetypeName}" personality is interested in becoming a "${careerName}". 
      Their identified skills to develop are: ${skillsToDevelop.join(', ')}.
      
      Create a concise, actionable, 3-step learning path to help them acquire these skills. For each step, provide a title, a short description (1-2 sentences), and a specific, real-world suggested resource (e.g., a well-known online course, book, platform, or project idea).
      Return the response as a valid JSON array.
    `;
    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.INTEGER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                suggestedResource: { type: Type.STRING }
              },
              required: ["step", "title", "description", "suggestedResource"]
            }
          }
        }
      });
      const jsonString = response.text.trim();
      return JSON.parse(jsonString) as LearningStep[];
    } catch (error) {
      console.error('Error fetching learning path from Gemini API:', error);
      return null;
    }
  }

  async getInterviewQuestions(archetypeName: string, careerName: string, growthAreas: { name: string }[]): Promise<InterviewQuestion[] | null> {
    const growthAreaNames = growthAreas.map(g => g.name).join(', ');
    const prompt = `
      You are an expert HR interviewer and career coach. A candidate with the "${archetypeName}" personality is applying for a "${careerName}" role. 
      Their potential growth areas are: ${growthAreaNames}.

      Generate 3 insightful interview questions for this candidate. Include one behavioral question that specifically and subtly probes one of their potential growth areas.
      For each question, provide a concise "proTip" (max 2-3 sentences) on how to best answer it, keeping the candidate's personality strengths and weaknesses in mind.
      Return the response as a valid JSON array.
    `;
    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                proTip: { type: Type.STRING }
              },
              required: ["question", "proTip"]
            }
          }
        }
      });
      const jsonString = response.text.trim();
      return JSON.parse(jsonString) as InterviewQuestion[];
    } catch (error) {
      console.error('Error fetching interview questions from Gemini API:', error);
      return null;
    }
  }

  async getCareerSimulation(archetypeName: string, careerName: string, growthAreas: { name: string }[]): Promise<CareerSimulation | null> {
    const growthAreaNames = growthAreas.map(g => g.name).join(', ');
    const prompt = `
      You are an expert in career simulation and interactive training. A user with the "${archetypeName}" personality is exploring a career as a "${careerName}". Their potential growth areas are: ${growthAreaNames}.

      Create a short, text-based career simulation challenge. The response must be a valid JSON object.
      1.  **scenario**: A concise, realistic workplace scenario (2-3 sentences) that a "${careerName}" might face. The scenario should present a problem or decision point that subtly relates to the user's archetype or growth areas.
      2.  **options**: An array of exactly THREE distinct, plausible actions the user could take. For each option, provide:
          a. **text**: The action described in a single sentence.
          b. **outcome**: A brief description of the immediate result of this action.
          c. **feedback**: A personalized analysis (2 sentences) explaining *why* this choice aligns well or poorly with the "${archetypeName}" personality. Reference a specific trait or growth area in your feedback.
    `;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenario: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    outcome: { type: Type.STRING },
                    feedback: { type: Type.STRING },
                  },
                  required: ["text", "outcome", "feedback"]
                }
              }
            },
            required: ["scenario", "options"]
          }
        }
      });
      const jsonString = response.text.trim();
      return JSON.parse(jsonString) as CareerSimulation;
    } catch (error) {
      console.error('Error fetching career simulation from Gemini API:', error);
      return null;
    }
  }
}
