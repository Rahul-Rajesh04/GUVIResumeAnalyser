import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useApp, UserProfile } from '../../contexts/AppContext';
import { projectSchema, workExperienceSchema, certificationSchema } from '../../lib/validations';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Plus, Edit, Trash2, Briefcase, FolderOpen, Award, ExternalLink } from 'lucide-react';

// Define types from schemas for better type safety
type Project = UserProfile['experience']['projects'][0];
type WorkExperience = UserProfile['experience']['workExperience'][0];
type Certification = UserProfile['experience']['certifications'][0];

type ProjectFormValues = z.infer<typeof projectSchema>;
type WorkExperienceFormValues = z.infer<typeof workExperienceSchema>;
type CertificationFormValues = z.infer<typeof certificationSchema>;

type EditingItem = 
  | { type: 'project'; data?: Project }
  | { type: 'work'; data?: WorkExperience }
  | { type: 'certification'; data?: Certification }
  | null;

// --- Project Form Component ---
const ProjectForm = ({ item, onSave, onCancel }: { item?: Project, onSave: (data: Project) => void, onCancel: () => void }) => {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: item?.title || '',
      description: item?.description || '',
      technologies: item?.technologies || [],
      url: item?.url || '',
    },
  });

  function onSubmit(data: ProjectFormValues) {
    onSave({
      id: item?.id || `proj-${Date.now()}`,
      title: data.title,
      description: data.description,
      technologies: data.technologies,
      url: data.url,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Project Title *</FormLabel>
            <FormControl><Input placeholder="My Awesome Project" {...field} className="bg-muted/30" /></FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description *</FormLabel>
            <FormControl><Textarea placeholder="Describe your project..." {...field} rows={4} className="bg-muted/30" /></FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <FormField control={form.control} name="technologies" render={({ field }) => (
          <FormItem>
            <FormLabel>Technologies Used</FormLabel>
            <FormControl>
              <Input 
                placeholder="React, Node.js, MongoDB (comma-separated)" 
                onChange={e => field.onChange(e.target.value.split(',').map(t => t.trim()).filter(Boolean))} 
                value={Array.isArray(field.value) ? field.value.join(', ') : ''} 
                className="bg-muted/30" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <FormField control={form.control} name="url" render={({ field }) => (
          <FormItem>
            <FormLabel>Project URL</FormLabel>
            <FormControl><Input placeholder="https://github.com/..." {...field} className="bg-muted/30" /></FormControl>
            <FormMessage />
          </FormItem>
        )}/>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="btn-hero">Save Project</Button>
        </div>
      </form>
    </Form>
  );
};

// --- Work Experience Form Component ---
const WorkExperienceForm = ({ item, onSave, onCancel }: { item?: WorkExperience, onSave: (data: WorkExperience) => void, onCancel: () => void }) => {
    const form = useForm<WorkExperienceFormValues>({
        resolver: zodResolver(workExperienceSchema),
        defaultValues: item || { company: '', position: '', duration: '', description: '' },
    });

    function onSubmit(data: WorkExperienceFormValues) {
        onSave({ id: item?.id || `work-${Date.now()}`, company: data.company, position: data.position, duration: data.duration, description: data.description });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="company" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company *</FormLabel>
                            <FormControl><Input placeholder="Company Name" {...field} className="bg-muted/30"/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="position" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Position *</FormLabel>
                            <FormControl><Input placeholder="Software Engineer Intern" {...field} className="bg-muted/30"/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl><Input placeholder="June 2024 - August 2024" {...field} className="bg-muted/30"/></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Describe your responsibilities..." {...field} rows={4} className="bg-muted/30"/></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" className="btn-hero">Save Experience</Button>
                </div>
            </form>
        </Form>
    );
};

// --- Certification Form Component ---
const CertificationForm = ({ item, onSave, onCancel }: { item?: Certification, onSave: (data: Certification) => void, onCancel: () => void }) => {
    const form = useForm<CertificationFormValues>({
        resolver: zodResolver(certificationSchema),
        defaultValues: item || { name: '', issuer: '', date: '' },
    });

    function onSubmit(data: CertificationFormValues) {
        onSave({ id: item?.id || `cert-${Date.now()}`, name: data.name, issuer: data.issuer, date: data.date });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Certification Name *</FormLabel>
                        <FormControl><Input placeholder="AWS Solutions Architect" {...field} className="bg-muted/30"/></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="issuer" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Issuing Organization *</FormLabel>
                            <FormControl><Input placeholder="Amazon Web Services" {...field} className="bg-muted/30"/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="date" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date Obtained</FormLabel>
                            <FormControl><Input placeholder="2024-03" {...field} className="bg-muted/30"/></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" className="btn-hero">Save Certification</Button>
                </div>
            </form>
        </Form>
    );
};


// --- Main ExperiencePage Component ---
export function ExperiencePage() {
  const { state, setState, updateCurrentUser } = useApp();
  const currentUser = state.currentUser;
  const [editingItem, setEditingItem] = useState<EditingItem>(null);
  const [activeTab, setActiveTab] = useState('projects');

  // Set the active tab if navigated from the dashboard
  useEffect(() => {
    if (state.activeExperienceTab) {
      setActiveTab(state.activeExperienceTab);
      // Reset the state to prevent it from always opening on the same tab
      setState(prev => ({...prev, activeExperienceTab: null}));
    }
  }, [state.activeExperienceTab, setState]);


  if (!currentUser) return null;

  const handleSave = (item: Project | WorkExperience | Certification) => {
    if (!editingItem) return;
    const { type } = editingItem;
    const updatedExperience = { ...currentUser.experience };

    if (type === 'project') {
        const projects = updatedExperience.projects || [];
        const index = projects.findIndex(p => p.id === item.id);
        if (index > -1) {
            updatedExperience.projects[index] = item as Project;
        } else {
            updatedExperience.projects.push(item as Project);
        }
    } else if (type === 'work') {
        const workExperience = updatedExperience.workExperience || [];
        const index = workExperience.findIndex(w => w.id === item.id);
        if (index > -1) {
            updatedExperience.workExperience[index] = item as WorkExperience;
        } else {
            updatedExperience.workExperience.push(item as WorkExperience);
        }
    } else if (type === 'certification') {
        const certifications = updatedExperience.certifications || [];
        const index = certifications.findIndex(c => c.id === item.id);
        if (index > -1) {
            updatedExperience.certifications[index] = item as Certification;
        } else {
            updatedExperience.certifications.push(item as Certification);
        }
    }

    updateCurrentUser({ experience: updatedExperience });
    setEditingItem(null);
  };
  
  const deleteItem = (type: 'projects' | 'workExperience' | 'certifications', id: string) => {
    const updatedExperience = { ...currentUser.experience };
    
    if (type === 'projects') {
      updatedExperience.projects = updatedExperience.projects.filter(item => item.id !== id);
    } else if (type === 'workExperience') {
      updatedExperience.workExperience = updatedExperience.workExperience.filter(item => item.id !== id);
    } else if (type === 'certifications') {
      updatedExperience.certifications = updatedExperience.certifications.filter(item => item.id !== id);
    }
    
    updateCurrentUser({ experience: updatedExperience });
  };
  
  return (
    <div className="space-y-8 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Professional Experience</h2>
        <p className="text-muted-foreground">Showcase your projects, work experience, and certifications.</p>
      </div>

      <Dialog open={!!editingItem} onOpenChange={(isOpen) => !isOpen && setEditingItem(null)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30">
            <TabsTrigger value="projects">Projects ({currentUser.experience.projects.length})</TabsTrigger>
            <TabsTrigger value="work">Work ({currentUser.experience.workExperience.length})</TabsTrigger>
            <TabsTrigger value="certifications">Certs ({currentUser.experience.certifications.length})</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Projects</h3>
              <Button onClick={() => setEditingItem({ type: 'project' })} className="btn-hero"><Plus className="w-4 h-4 mr-2" />Add Project</Button>
            </div>
            {currentUser.experience.projects.length === 0 ? (
              <Card className="p-8 text-center"><FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p>No projects added yet.</p></Card>
            ) : (
              currentUser.experience.projects.map((project) => (
                <Card key={project.id} className="card-elevated p-6">
                   <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{project.title}</h4>
                        <p className="text-muted-foreground mb-2">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies?.map((tech, i) => <Badge key={i} variant="secondary">{tech}</Badge>)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingItem({ type: 'project', data: project })}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteItem('projects', project.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                   </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Work Experience Tab */}
          <TabsContent value="work" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <Button onClick={() => setEditingItem({ type: 'work' })} className="btn-hero"><Plus className="w-4 h-4 mr-2" />Add Experience</Button>
            </div>
            {currentUser.experience.workExperience.length === 0 ? (
              <Card className="p-8 text-center"><Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p>No work experience added yet.</p></Card>
            ) : (
              currentUser.experience.workExperience.map((work) => (
                <Card key={work.id} className="card-elevated p-6">
                   <div className="flex justify-between items-start">
                      <div>
                          <h4 className="font-semibold text-lg">{work.position}</h4>
                          <p className="text-primary font-medium">{work.company}</p>
                          <p className="text-sm text-muted-foreground">{work.duration}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingItem({ type: 'work', data: work })}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteItem('workExperience', work.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                   </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-4">
             <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Certifications</h3>
              <Button onClick={() => setEditingItem({ type: 'certification' })} className="btn-hero"><Plus className="w-4 h-4 mr-2" />Add Certification</Button>
            </div>
            {currentUser.experience.certifications.length === 0 ? (
              <Card className="p-8 text-center"><Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p>No certifications added yet.</p></Card>
            ) : (
              currentUser.experience.certifications.map((cert) => (
                <Card key={cert.id} className="card-elevated p-6">
                   <div className="flex justify-between items-start">
                      <div>
                          <h4 className="font-semibold text-lg">{cert.name}</h4>
                          <p className="text-primary font-medium">{cert.issuer}</p>
                          <p className="text-sm text-muted-foreground">{cert.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingItem({ type: 'certification', data: cert })}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteItem('certifications', cert.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                   </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
        
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem?.data ? 'Edit' : 'Add'} {editingItem?.type === 'project' ? 'Project' : editingItem?.type === 'work' ? 'Work Experience' : 'Certification'}
            </DialogTitle>
          </DialogHeader>
          {editingItem?.type === 'project' && <ProjectForm item={editingItem.data} onSave={handleSave} onCancel={() => setEditingItem(null)} />}
          {editingItem?.type === 'work' && <WorkExperienceForm item={editingItem.data} onSave={handleSave} onCancel={() => setEditingItem(null)} />}
          {editingItem?.type === 'certification' && <CertificationForm item={editingItem.data} onSave={handleSave} onCancel={() => setEditingItem(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}