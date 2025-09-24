// src/ai/RoadmapEngine.ts
import { UserProfile } from '../contexts/AppContext';

// You can define a more specific type for the Roadmap if you like
export interface Roadmap {
  title: string;
  focus: string;
  weeks: any[]; // Consider defining a stricter type for weeks and tasks
  error?: boolean;
  message?: string;
}

export async function generateRoadmap(userProfile: UserProfile): Promise<Roadmap> {
  const API_ENDPOINT = 'http://localhost:3001/api/generate-roadmap';

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userProfile }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server responded with an error:', errorData);
      return {
        error: true,
        message: errorData.message || 'Failed to generate roadmap.',
        title: '',
        focus: '',
        weeks: [],
      };
    }

    const roadmapResult: Roadmap = await response.json();
    return roadmapResult;

  } catch (error) {
    console.error('Failed to fetch from backend:', error);
    return {
      error: true,
      message: 'Could not connect to the server. Please ensure it is running.',
      title: '',
      focus: '',
      weeks: [],
    };
  }
}