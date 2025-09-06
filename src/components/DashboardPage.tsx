import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { 
  User, 
  Target, 
  Code, 
  Briefcase, 
  Award, 
  TrendingUp,
  Brain,
  FileText,
  MessageCircle,
  ArrowRight,
  CheckCircle,
  Plus,
  LogOut
} from 'lucide-react';
import careerCopilotLogo from '../assets/career-copilot-logo.png';

export function DashboardPage() {
  const { state, navigateToPage, navigateToExperienceTab, calculateProfileCompleteness, getProfileStats } = useApp();
  const currentUser = state.currentUser;

  if (!currentUser) return null;

  const completeness = calculateProfileCompleteness();
  const stats = getProfileStats();

  const getProfileSuggestions = () => {
    const suggestions = [];
    
    if (!currentUser.personalDetails.fullName || !currentUser.personalDetails.email) {
      suggestions.push({ text: 'Complete your personal details', page: 'wizard' });
    }
    
    if (currentUser.skills.length === 0) {
      suggestions.push({ text: 'Add your skills and expertise', page: 'wizard' });
    }
    
    if (currentUser.experience.projects.length === 0) {
      suggestions.push({ text: 'Add a project to your portfolio', page: 'wizard' });
    }
    
    if (!currentUser.goals.shortTermGoal || !currentUser.goals.longTermGoal) {
      suggestions.push({ text: 'Define your career goals', page: 'wizard' });
    }
    
    if (currentUser.experience.workExperience.length === 0) {
      suggestions.push({ text: 'Add work experience or internships', page: 'wizard' });
    }

    return suggestions.slice(0, 3); // Show max 3 suggestions
  };

  const suggestions = getProfileSuggestions();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={careerCopilotLogo} 
                alt="AI Career Copilot" 
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <h1 className="text-xl font-semibold text-foreground">AI Career Copilot</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {currentUser.personalDetails.fullName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="btn-ghost" onClick={() => navigateToPage('wizard')}>
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateToPage('welcome')}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Switch Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Profile Completeness */}
        <div className="mb-8 animate-fade-in">
          <Card className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Profile Completeness</h2>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {completeness}% Complete
              </Badge>
            </div>
            
            <Progress value={completeness} className="h-3 mb-4 progress-glow" />
            
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-foreground mb-3">Suggested Actions:</h3>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => navigateToPage(suggestion.page)}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{suggestion.text}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </button>
                ))}
              </div>
            )}
            
            {completeness === 100 && (
              <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-success">
                  Perfect! Your profile is complete and ready for AI-powered recommendations.
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-slide-up">
          <Card className="card-elevated p-6 text-center card-interactive" onClick={() => navigateToPage('wizard')}>
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.totalSkills}</h3>
            <p className="text-muted-foreground">Skills Added</p>
          </Card>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="card-elevated p-6 text-center card-interactive" onClick={() => navigateToExperienceTab('projects')}>
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{stats.totalProjects}</h3>
                <p className="text-muted-foreground">Projects</p>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <h4 className="font-semibold mb-2">Projects</h4>
              {currentUser.experience.projects.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {currentUser.experience.projects.map(p => <li key={p.id} className="text-sm truncate">{p.title}</li>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No projects added yet.</p>}
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="card-elevated p-6 text-center card-interactive" onClick={() => navigateToExperienceTab('work')}>
                <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{stats.totalWorkExperience}</h3>
                <p className="text-muted-foreground">Work Experience</p>
              </Card>
            </HoverCardTrigger>
             <HoverCardContent className="w-80">
              <h4 className="font-semibold mb-2">Work Experience</h4>
              {currentUser.experience.workExperience.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {currentUser.experience.workExperience.map(w => <li key={w.id} className="text-sm truncate">{w.position} at {w.company}</li>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No work experience added yet.</p>}
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Card className="card-elevated p-6 text-center card-interactive" onClick={() => navigateToExperienceTab('certifications')}>
                <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-warning-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{stats.totalCertifications}</h3>
                <p className="text-muted-foreground">Certifications</p>
              </Card>
            </HoverCardTrigger>
             <HoverCardContent className="w-80">
              <h4 className="font-semibold mb-2">Certifications</h4>
              {currentUser.experience.certifications.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {currentUser.experience.certifications.map(c => <li key={c.id} className="text-sm truncate">{c.name}</li>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No certifications added yet.</p>}
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* Profile Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Key Details */}
          <Card className="card-elevated p-6 animate-bounce-in">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Key Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">University:</span>
                <span className="font-medium">{currentUser.personalDetails.university || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Major:</span>
                <span className="font-medium">{currentUser.personalDetails.major || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{currentUser.personalDetails.location || 'Not specified'}</span>
              </div>
            </div>
          </Card>

          {/* Career Goals */}
          <Card className="card-elevated p-6 animate-bounce-in">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Career Goals</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Short-term Goal:</p>
                <p className="font-medium text-sm">
                  {currentUser.goals.shortTermGoal || 'Not defined yet'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Long-term Goal:</p>
                <p className="font-medium text-sm">
                  {currentUser.goals.longTermGoal || 'Not defined yet'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Skills & Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Skills */}
          <Card className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Top Skills</h3>
            </div>
            {currentUser.skills.length === 0 ? (
              <p className="text-muted-foreground text-sm">No skills added yet. Add your first skill to get started!</p>
            ) : (
              <div className="space-y-2">
                {currentUser.skills.slice(0, 5).map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill.name}</span>
                    <Badge 
                      variant="secondary"
                      className={`text-xs ${
                        skill.proficiency === 'Advanced' ? 'bg-success/20 text-success' :
                        skill.proficiency === 'Intermediate' ? 'bg-warning/20 text-warning' :
                        'bg-muted'
                      }`}
                    >
                      {skill.proficiency}
                    </Badge>
                  </div>
                ))}
                {currentUser.skills.length > 5 && (
                  <p className="text-xs text-muted-foreground pt-2">
                    And {currentUser.skills.length - 5} more skills...
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Recent Projects */}
          <Card className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Recent Projects</h3>
            </div>
            {currentUser.experience.projects.length === 0 ? (
              <p className="text-muted-foreground text-sm">No projects added yet. Add your first project to showcase your work!</p>
            ) : (
              <div className="space-y-3">
                {currentUser.experience.projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="border border-border/50 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-1">{project.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {project.description}
                    </p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* AI Action Panel */}
        <Card className="card-elevated p-8 text-center animate-fade-in">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">AI-Powered Career Tools</h2>
            <p className="text-muted-foreground">
              Use our advanced AI tools to accelerate your career development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button
              onClick={() => navigateToPage('roadmap')}
              className="btn-hero h-20 flex-col gap-2 text-base"
              disabled={completeness < 50}
            >
              <Brain className="w-6 h-6" />
              <span>Generate Career Roadmap</span>
            </Button>

            <Button
              onClick={() => navigateToPage('resume-analyzer')}
              className="btn-accent h-20 flex-col gap-2 text-base"
              disabled={completeness < 30}
            >
              <FileText className="w-6 h-6" />
              <span>Analyze Resume</span>
            </Button>

            <Button
              onClick={() => navigateToPage('interview')}
              className="btn-hero h-20 flex-col gap-2 text-base"
              disabled={completeness < 40}
            >
              <MessageCircle className="w-6 h-6" />
              <span>Start Mock Interview</span>
            </Button>
          </div>

          {completeness < 50 && (
            <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning-foreground">
                Complete more of your profile ({completeness}% done) to unlock all AI features.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}