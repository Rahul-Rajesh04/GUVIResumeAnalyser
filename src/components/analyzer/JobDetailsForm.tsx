// src/components/analyzer/JobDetailsForm.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  goalJob: string;
  goalJobDescription: string;
  isAnalyzing: boolean;
  isProcessingFile: boolean;
  setGoalJob: (value: string) => void;
  setGoalJobDescription: (value: string) => void;
  handleAnalyze: () => void;
}

export function JobDetailsForm({
  goalJob,
  goalJobDescription,
  isAnalyzing,
  isProcessingFile,
  setGoalJob,
  setGoalJobDescription,
  handleAnalyze,
}: Props) {
  return (
    <Card className="p-6 bg-muted/50">
      <div className="space-y-4">
        <div>
          <Label htmlFor="goalJob" className="font-semibold">Target Job Title (Optional) </Label>
          <Input
            id="goalJob"
            placeholder="e.g., Senior Frontend Developer"
            value={goalJob}
            onChange={(e) => setGoalJob(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="jobDescription" className="font-semibold">Target Job Description (Optional)</Label>
          <Textarea
            id="jobDescription"
            placeholder="Paste the job description here..."
            value={goalJobDescription}
            onChange={(e) => setGoalJobDescription(e.target.value)}
            rows={6}
            className="mt-1"
          />
        </div>
        <div className="text-center pt-2">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || isProcessingFile}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Resume Alignment'}
          </Button>
        </div>
      </div>
    </Card>
  );
}