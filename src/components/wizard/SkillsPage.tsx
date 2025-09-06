import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { skillCategories } from '../../data/skillsData';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Plus, Trash2, Edit, ChevronDown, ChevronRight, Code, Database, Palette, Users, Cloud, Shield } from 'lucide-react';

const categoryIcons = {
  'Programming Languages': Code,
  'Web Development': Code,
  'Mobile Development': Code,
  'Data Science & Analytics': Database,
  'Cloud & DevOps': Cloud,
  'Database Technologies': Database,
  'Design & UX': Palette,
  'Soft Skills': Users,
  'Tools & Frameworks': Code,
  'Cybersecurity': Shield
};

export function SkillsPage() {
  const { state, updateCurrentUser } = useApp();
  const currentUser = state.currentUser;
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Programming Languages']);
  const [editingSkill, setEditingSkill] = useState<{ id: string; proficiency: string } | null>(null);

  if (!currentUser) return null;

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const addSkill = (skillName: string, category: string) => {
    const newSkill = {
      id: `skill-${Date.now()}`,
      name: skillName,
      category,
      proficiency: 'Beginner' as const
    };

    updateCurrentUser({
      skills: [...currentUser.skills, newSkill]
    });
  };

  const removeSkill = (skillId: string) => {
    updateCurrentUser({
      skills: currentUser.skills.filter(skill => skill.id !== skillId)
    });
  };

  const updateSkillProficiency = (skillId: string, proficiency: 'Beginner' | 'Intermediate' | 'Advanced') => {
    updateCurrentUser({
      skills: currentUser.skills.map(skill =>
        skill.id === skillId ? { ...skill, proficiency } : skill
      )
    });
    setEditingSkill(null);
  };

  const filteredCategories = Object.entries(skillCategories).map(([category, skills]) => ({
    category,
    skills: skills.filter(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !currentUser.skills.some(userSkill => userSkill.name === skill)
    )
  })).filter(({ skills }) => skills.length > 0);

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Skills & Expertise</h2>
        <p className="text-muted-foreground">Add your technical and soft skills to showcase your capabilities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Skills Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Available Skills</h3>
            <Badge variant="secondary">{Object.values(skillCategories).flat().length} total</Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Skills Categories */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCategories.map(({ category, skills }) => {
              const isExpanded = expandedCategories.includes(category);
              const Icon = categoryIcons[category as keyof typeof categoryIcons] || Code;

              return (
                <div key={category} className="card-elevated rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">{category}</span>
                      <Badge variant="outline" className="text-xs">{skills.length}</Badge>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-1">
                      {skills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center justify-between py-2 px-3 hover:bg-muted/30 rounded-md group"
                        >
                          <span className="text-sm text-foreground">{skill}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addSkill(skill, category)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* My Skills Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">My Skills</h3>
            <Badge variant="secondary">{currentUser.skills.length} added</Badge>
          </div>

          {currentUser.skills.length === 0 ? (
            <div className="card-elevated p-8 text-center">
              <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No skills added yet. Select skills from the left panel to get started.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentUser.skills.map((skill) => (
                <div key={skill.id} className="card-elevated p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{skill.name}</span>
                        <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Proficiency:</span>
                        <Badge 
                          variant={skill.proficiency === 'Advanced' ? 'default' : 'secondary'}
                          className={`text-xs cursor-pointer ${
                            skill.proficiency === 'Advanced' ? 'bg-success' :
                            skill.proficiency === 'Intermediate' ? 'bg-warning text-warning-foreground' :
                            'bg-muted'
                          }`}
                          onClick={() => setEditingSkill({ id: skill.id, proficiency: skill.proficiency })}
                        >
                          {skill.proficiency}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingSkill({ id: skill.id, proficiency: skill.proficiency })}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSkill(skill.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Proficiency Dialog */}
      {editingSkill && (
        <Dialog open={!!editingSkill} onOpenChange={() => setEditingSkill(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Skill Proficiency</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                How would you rate your proficiency in this skill?
              </p>
              <Select
                value={editingSkill.proficiency}
                onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => 
                  updateSkillProficiency(editingSkill.id, value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner - Just getting started</SelectItem>
                  <SelectItem value="Intermediate">Intermediate - Some experience</SelectItem>
                  <SelectItem value="Advanced">Advanced - Highly proficient</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Info Box */}
      <div className="card-elevated p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Code className="w-3 h-3 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Skill Assessment Tips</h4>
            <p className="text-sm text-muted-foreground">
              Be honest about your proficiency levels. This helps us create more accurate career recommendations and learning paths for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}