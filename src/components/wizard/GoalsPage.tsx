import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { careerGoals } from '../../data/skillsData';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Combobox } from '../ui/combobox';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Target, Star, Plus, X, Lightbulb } from 'lucide-react';

export function GoalsPage() {
  const { state, updateCurrentUser } = useApp();
  const currentUser = state.currentUser;
  const [newInterest, setNewInterest] = useState('');

  if (!currentUser) return null;

  const handleGoalChange = (field: 'shortTermGoal' | 'longTermGoal', value: string) => {
    updateCurrentUser({
      goals: {
        ...currentUser.goals,
        [field]: value
      }
    });
  };

  const addInterest = () => {
    if (!newInterest.trim()) return;
    
    const updatedInterests = [...currentUser.goals.interests, newInterest.trim()];
    updateCurrentUser({
      goals: {
        ...currentUser.goals,
        interests: updatedInterests
      }
    });
    setNewInterest('');
  };

  const removeInterest = (indexToRemove: number) => {
    const updatedInterests = currentUser.goals.interests.filter((_, index) => index !== indexToRemove);
    updateCurrentUser({
      goals: {
        ...currentUser.goals,
        interests: updatedInterests
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Goals & Interests</h2>
        <p className="text-muted-foreground">Define your career aspirations and professional interests to get personalized guidance.</p>
      </div>

      <div className="space-y-8">
        {/* Professional Interests */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-primary" />
            <Label className="text-lg font-semibold text-foreground">Professional Interests</Label>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4">
            Add areas that interest you professionally. These help us understand your passions and recommend relevant opportunities.
          </p>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., Machine Learning, Web Development, Data Science..."
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-muted/30 border-border/50 focus:border-primary/50"
            />
            <Button onClick={addInterest} className="btn-hero">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Interests */}
          {currentUser.goals.interests.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Your Interests:</h4>
              <div className="flex flex-wrap gap-2">
                {currentUser.goals.interests.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  >
                    {interest}
                    <button
                      onClick={() => removeInterest(index)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Career Goals Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Short-term Goal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <Label className="text-lg font-semibold text-foreground">Short-term Goal</Label>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              What do you want to achieve in the next 6-12 months?
            </p>
            <Combobox
              options={careerGoals.shortTerm.map(goal => ({ label: goal, value: goal }))}
              value={currentUser.goals.shortTermGoal}
              onChange={(value) => handleGoalChange('shortTermGoal', value)}
              placeholder="Select or type your short-term goal..."
              emptyText="No matching goals found. Type to add your own."
              className="h-12 bg-muted/30 border-border/50 focus:border-primary/50"
              allowCustomValue={true}
            />
          </div>

          {/* Long-term Goal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-accent" />
              <Label className="text-lg font-semibold text-foreground">Long-term Goal</Label>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Where do you see yourself in 3-5 years?
            </p>
            <Combobox
              options={careerGoals.longTerm.map(goal => ({ label: goal, value: goal }))}
              value={currentUser.goals.longTermGoal}
              onChange={(value) => handleGoalChange('longTermGoal', value)}
              placeholder="Select or type your long-term goal..."
              emptyText="No matching goals found. Type to add your own."
              className="h-12 bg-muted/30 border-border/50 focus:border-primary/50"
              allowCustomValue={true}
            />
          </div>
        </div>
        
        {/* Selected Goals Display Section */}
        {(currentUser.goals.shortTermGoal || currentUser.goals.longTermGoal) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentUser.goals.shortTermGoal ? (
                  <div className="card-elevated p-4 bg-primary/5 border-primary/20">
                      <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Target className="w-3 h-3 text-primary" />
                          </div>
                          <div>
                              <h4 className="font-medium text-foreground mb-1">Your Short-term Goal</h4>
                              <p className="text-sm text-muted-foreground">{currentUser.goals.shortTermGoal}</p>
                          </div>
                      </div>
                  </div>
              ) : <div></div>}

              {currentUser.goals.longTermGoal ? (
                  <div className="card-elevated p-4 bg-accent/5 border-accent/20">
                      <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Star className="w-3 h-3 text-accent" />
                          </div>
                          <div>
                              <h4 className="font-medium text-foreground mb-1">Your Long-term Goal</h4>
                              <p className="text-sm text-muted-foreground">{currentUser.goals.longTermGoal}</p>
                          </div>
                      </div>
                  </div>
              ) : <div></div>}
          </div>
        )}


        {/* Goal Alignment Message */}
        {currentUser.goals.shortTermGoal && currentUser.goals.longTermGoal && (
          <div className="card-elevated p-6 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Great! Your Goals Are Set</h4>
                <p className="text-muted-foreground mb-4">
                  We'll use your goals to create personalized career roadmaps and suggest relevant learning paths, 
                  projects, and opportunities that align with your aspirations.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">Short-term focus:</span>
                    <span className="text-sm text-muted-foreground">{currentUser.goals.shortTermGoal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-sm font-medium">Long-term vision:</span>
                    <span className="text-sm text-muted-foreground">{currentUser.goals.longTermGoal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card-elevated p-6 bg-muted/30 border-border/50">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-3 h-3 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Goal Setting Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Make your goals specific and measurable</li>
              <li>• Ensure your short-term goals support your long-term vision</li>
              <li>• You can always update these goals as you grow and learn</li>
              <li>• Consider what skills and experiences you'll need to achieve these goals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}