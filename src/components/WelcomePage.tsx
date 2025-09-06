import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, User, Calendar, Plus, Trash2, LogIn, Brain, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import careerCopilotLogo from '../assets/career-copilot-logo.png';

export function WelcomePage() {
  const { state, createNewProfile, selectProfile, deleteProfile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const filteredProfiles = state.profiles.filter(profile =>
    profile.personalDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.personalDetails.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.personalDetails.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card/30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <img 
                src={careerCopilotLogo} 
                alt="AI Career Copilot" 
                className="w-24 h-24 rounded-2xl shadow-glow group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute -inset-2 bg-gradient-primary rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="text-gradient text-glow">AI Career</span>
            <br />
            <span className="text-foreground">Copilot</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Your personalized AI mentor for career success. From profile creation to career readiness, 
            we guide college students every step of the way.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              AI-Powered Guidance
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Personalized Roadmaps
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <User className="w-4 h-4 mr-2" />
              Career Mentorship
            </Badge>
          </div>
        </div>

        {/* Profile Management Section */}
        <div className="max-w-4xl mx-auto">
          <div className="card-elevated rounded-2xl p-8 mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Select Your Profile</h2>
              <Button 
                onClick={createNewProfile}
                className="btn-hero"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Profile
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search profiles by name, email, or university..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 bg-muted/50 border-border/50 focus:border-primary/50 text-lg"
              />
            </div>

            {/* Profiles List */}
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {filteredProfiles.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    {searchTerm ? 'No profiles found matching your search.' : 'No profiles found. Create your first profile to get started!'}
                  </p>
                </div>
              ) : (
                filteredProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`card-interactive rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                      selectedProfileId === profile.id 
                        ? 'ring-2 ring-primary border-primary/50 bg-primary/5' 
                        : 'hover:border-primary/30'
                    }`}
                    onClick={() => setSelectedProfileId(profile.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-lg">
                            {profile.personalDetails.fullName.charAt(0) || '?'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">
                              {profile.personalDetails.fullName || 'Unnamed Profile'}
                            </h3>
                            <p className="text-muted-foreground">
                              {profile.personalDetails.email || 'No email provided'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground ml-16">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Last modified: {profile.lastModified}</span>
                          </div>
                          {profile.personalDetails.university && (
                            <Badge variant="outline" className="text-xs">
                              {profile.personalDetails.university}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons */}
            {selectedProfileId && (
              <div className="flex justify-between items-center pt-6 border-t border-border mt-6">
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteProfile(selectedProfileId);
                    setSelectedProfileId(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Profile
                </Button>
                
                <Button
                  onClick={() => selectProfile(selectedProfileId)}
                  className="btn-hero px-8"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Enter Dashboard
                </Button>
              </div>
            )}
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <Card className="card-elevated p-6 text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">AI Roadmaps</h3>
              <p className="text-muted-foreground text-sm">Get personalized career paths based on your goals and skills.</p>
            </Card>
            
            <Card className="card-elevated p-6 text-center">
              <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Resume Analysis</h3>
              <p className="text-muted-foreground text-sm">AI-powered feedback to optimize your resume for success.</p>
            </Card>
            
            <Card className="card-elevated p-6 text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Mock Interviews</h3>
              <p className="text-muted-foreground text-sm">Practice with AI and get detailed performance feedback.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}