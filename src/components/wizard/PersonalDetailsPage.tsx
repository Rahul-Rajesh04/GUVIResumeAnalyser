import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { universities, majors } from '../../data/skillsData';
import { countryCodes } from '../../data/countryData';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Combobox } from '../ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { User, Mail, Phone, MapPin, GraduationCap, BookOpen, Edit } from 'lucide-react';
import { Button } from '../ui/button';

export function PersonalDetailsPage() {
  const { state, updateCurrentUser } = useApp();
  const currentUser = state.currentUser;
  const [showCustomUniversityInput, setShowCustomUniversityInput] = useState(false);
  
  if (!currentUser) return null;

  const handleInputChange = (field: string, value: string) => {
    updateCurrentUser({
      personalDetails: {
        ...currentUser.personalDetails,
        [field]: value
      }
    });
  };

  const handlePhoneChange = (part: 'countryCode' | 'number', value: string) => {
    updateCurrentUser({
      personalDetails: {
        ...currentUser.personalDetails,
        phone: {
          ...currentUser.personalDetails.phone,
          [part]: value
        }
      }
    });
  };
  
  const handleUniversitySelect = (value: string) => {
    handleInputChange('university', value);
    // If a university is selected from the list, ensure we are not showing the custom input
    if (showCustomUniversityInput) {
      setShowCustomUniversityInput(false);
    }
  };


  return (
    <div className="space-y-8 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Personal & Educational Details</h2>
        <p className="text-muted-foreground">Let's start with your basic information and educational background.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2 text-foreground">
            <User className="w-4 h-4" />
            Full Name *
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={currentUser.personalDetails.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className="h-12 bg-muted/30 border-border/50 focus:border-primary/50"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
            <Mail className="w-4 h-4" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@university.edu"
            value={currentUser.personalDetails.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="h-12 bg-muted/30 border-border/50 focus:border-primary/50"
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
            <Phone className="w-4 h-4" />
            Phone Number
          </Label>
          <div className="flex gap-2">
            <Select
              value={currentUser.personalDetails.phone.countryCode}
              onValueChange={(value) => handlePhoneChange('countryCode', value)}
            >
              <SelectTrigger className="w-[120px] h-12 bg-muted/30 border-border/50 focus:border-primary/50">
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((country) => (
                  <SelectItem key={country.name} value={country.code}>
                    {country.flag} {country.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="phone"
              type="tel"
              placeholder="555-123-4567"
              value={currentUser.personalDetails.phone.number}
              onChange={(e) => handlePhoneChange('number', e.target.value)}
              className="h-12 bg-muted/30 border-border/50 focus:border-primary/50"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2 text-foreground">
            <MapPin className="w-4 h-4" />
            Location
          </Label>
          <Input
            id="location"
            type="text"
            placeholder="City, State/Country"
            value={currentUser.personalDetails.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="h-12 bg-muted/30 border-border/50 focus:border-primary/50"
          />
        </div>

        {/* University */}
        <div className="space-y-2">
            <Label htmlFor="university" className="flex items-center gap-2 text-foreground">
                <GraduationCap className="w-4 h-4" />
                University *
            </Label>
            {showCustomUniversityInput ? (
                <div className="flex items-center gap-2">
                    <Input
                        id="customUniversity"
                        type="text"
                        placeholder="Enter your university name"
                        value={currentUser.personalDetails.university}
                        onChange={(e) => handleInputChange('university', e.target.value)}
                        className="h-12 bg-muted/30 border-border/50 focus:border-primary/50"
                    />
                    <Button variant="ghost" onClick={() => setShowCustomUniversityInput(false)}>Search List</Button>
                </div>
            ) : (
                <>
                    <Combobox
                        options={universities.map(uni => ({ label: uni, value: uni }))}
                        value={currentUser.personalDetails.university}
                        onChange={handleUniversitySelect}
                        placeholder="Search or select your university..."
                        emptyText="No university found."
                        className="h-12 bg-muted/30 border-border/50 focus:border-primary/50"
                    />
                    <Button 
                        variant="link" 
                        className="p-0 h-auto text-xs text-muted-foreground"
                        onClick={() => setShowCustomUniversityInput(true)}
                    >
                        University not listed? Click here to add it.
                    </Button>
                </>
            )}
        </div>

        {/* Major */}
        <div className="space-y-2">
          <Label htmlFor="major" className="flex items-center gap-2 text-foreground">
            <BookOpen className="w-4 h-4" />
            Major/Field of Study *
          </Label>
          <Combobox
            options={majors.map(major => ({ label: major, value: major }))}
            value={currentUser.personalDetails.major}
            onChange={(value) => handleInputChange('major', value)}
            placeholder="Search or type your major..."
            emptyText="No major found."
            className="h-12 bg-muted/30 border-border/50 focus:border-primary/50"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="card-elevated p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <User className="w-3 h-3 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Why do we need this information?</h4>
            <p className="text-sm text-muted-foreground">
              Your personal and educational details help us create personalized career recommendations 
              and connect you with relevant opportunities in your field of study.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}