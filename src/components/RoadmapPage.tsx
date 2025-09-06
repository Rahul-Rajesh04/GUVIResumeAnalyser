// src/components/RoadmapPage.tsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { generateRoadmap, Roadmap } from '../ai/RoadmapEngine';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowLeft, Brain, CheckCircle2, Circle, Target } from 'lucide-react';

export function RoadmapPage() {
  const { state, navigateToPage } = useApp();
  const currentUser = state.currentUser;
  const [isGenerating, setIsGenerating] = useState(true);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (currentUser) {
        setIsGenerating(true);
        const result = await generateRoadmap(currentUser);
        setRoadmap(result);
        setIsGenerating(false);
      }
    };

    fetchRoadmap();
  }, [currentUser]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Brain className="h-12 w-12 mb-4 animate-pulse text-primary" />
        <h2 className="text-2xl font-semibold mb-2">Generating Your Roadmap...</h2>
        <p className="text-muted-foreground">Our AI is crafting a personalized plan just for you. This might take a moment.</p>
        <Progress value={50} className="w-full max-w-md mt-4" />
      </div>
    );
  }

  if (!roadmap || roadmap.error) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center text-center">
         <h1 className="text-2xl font-bold mb-4">{roadmap?.title || "Error"}</h1>
        <p className="text-red-500">{roadmap?.message || "Could not generate a roadmap."}</p>
        <Button onClick={() => navigateToPage('welcome')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const totalTasks = roadmap.weeks?.reduce((acc, week) => acc + week.tasks.length, 0) || 0;
  const progress = totalTasks > 0 ? (completedTasks.size / totalTasks) * 100 : 0;

  return (
    <div className="p-4 md:p-6">
      <Button onClick={() => navigateToPage('dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="p-6 mb-6">
        <div className="flex items-center mb-4">
          <Target className="h-8 w-8 mr-4 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{roadmap.title}</h1>
            <p className="text-muted-foreground">{roadmap.focus}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </Card>

      <div className="space-y-6">
        {roadmap.weeks?.map((week) => (
          <Card key={week.week}>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-1">Week {week.week}: {week.title}</h2>
              <p className="text-muted-foreground mb-4">{week.focus}</p>
              <ul className="space-y-3">
                {week.tasks.map((task) => (
                  <li
                    key={task.id}
                    className={`flex items-start p-3 rounded-lg transition-colors cursor-pointer ${
                      completedTasks.has(task.id) ? 'bg-green-100 dark:bg-green-900/30' : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                    onClick={() => toggleTask(task.id)}
                  >
                    {completedTasks.has(task.id) ? (
                      <CheckCircle2 className="h-5 w-5 mr-3 mt-1 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 mr-3 mt-1 text-muted-foreground flex-shrink-0" />
                    )}
                    <div>
                      <span className={`font-medium ${completedTasks.has(task.id) ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                      <p className={`text-sm text-muted-foreground ${completedTasks.has(task.id) ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}