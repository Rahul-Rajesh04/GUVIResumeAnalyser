import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { PersonalDetailsPage } from './wizard/PersonalDetailsPage';
import { SkillsPage } from './wizard/SkillsPage';
import { ExperiencePage } from './wizard/ExperiencePage';
import { GoalsPage } from './wizard/GoalsPage';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, Check, Save } from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal Details', component: PersonalDetailsPage },
  { id: 2, title: 'Skills & Expertise', component: SkillsPage },
  { id: 3, title: 'Experience', component: ExperiencePage },
  { id: 4, title: 'Goals & Interests', component: GoalsPage }
];

export function ProfileWizard() {
  const { state, navigateToPage } = useApp();
  const { currentUser } = state;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // A new profile won't have a name, an existing one will.
    // This determines if we are in "edit" mode.
    if (currentUser && currentUser.personalDetails.fullName) {
      setIsEditing(true);
    }
  }, [currentUser]);


  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentComponent = currentStepData?.component;
  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete wizard and go to dashboard
      navigateToPage('dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // If editing, go back to dashboard. If creating, go back to welcome.
      navigateToPage(isEditing ? 'dashboard' : 'welcome');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Edit Profile' : 'Profile Setup'}
            </h1>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {steps.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progress} className="h-3 progress-glow" />
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mr-2 ${
                      step.id < currentStep
                        ? 'bg-primary text-primary-foreground'
                        : step.id === currentStep
                        ? 'bg-primary/20 border-2 border-primary text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          <div className="card-elevated rounded-2xl p-8 mb-8 animate-fade-in">
            {CurrentComponent && <CurrentComponent />}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="btn-ghost"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? (isEditing ? 'Back to Dashboard' : 'Back to Welcome') : 'Previous'}
            </Button>

            <Button
              onClick={handleNext}
              className="btn-hero"
            >
              {currentStep === steps.length ? (
                isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Profile
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                )
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}