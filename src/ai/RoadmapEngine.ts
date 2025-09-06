// src/ai/RoadmapEngine.ts
import { UserProfile } from '../contexts/AppContext';
import { generateRoadmapWithGemini } from './gemini.server';

export interface Roadmap {
  title: string;
  focus: string;
  weeks?: Array<{
    week: number;
    title: string;
    focus: string;
    tasks: Array<{
      id: string;
      title: string;
      description: string;
      completed: boolean;
    }>;
  }>;
  error?: string;
  message?: string;
}

export async function generateRoadmap(user: UserProfile): Promise<Roadmap> {
  const longTermGoal = user.goals.longTermGoal;
  if (!longTermGoal) {
    return {
      title: "Goal Not Set",
      focus: "",
      error: "Long-term goal not set. Please define your goal in the profile wizard."
    };
  }

  // This now calls your new Gemini function
  return await generateRoadmapWithGemini(user);
}