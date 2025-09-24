// src/components/analyzer/AnalysisResultDisplay.tsx
import { ThumbsUp, ThumbsDown, Lightbulb, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ResumeAnalysis } from '@/ai/ResumeEngine';
import { Button } from '@/components/ui/button';

interface Props {
  isAnalyzing: boolean;
  analysisResult: ResumeAnalysis | null;
  clearFile: () => void;
}

const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high': return 'text-red-500';
    case 'medium': return 'text-yellow-500';
    case 'low': return 'text-blue-500';
    default: return 'text-gray-500';
  }
};

export function AnalysisResultDisplay({ isAnalyzing, analysisResult, clearFile }: Props) {
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-4">
        <Zap className="h-10 w-10 mb-4 animate-pulse text-primary" />
        <h3 className="text-xl font-semibold mb-2">Analyzing...</h3>
        <p className="text-muted-foreground">Our AI is reviewing your resume. This may take a moment.</p>
        <Progress value={50} className="w-full max-w-sm mt-4" />
      </div>
    );
  }

  if (!analysisResult) return null;

  if (analysisResult.error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">
        <h3 className="font-bold">Analysis Failed</h3>
        <p>{analysisResult.message}</p>
        <div className="text-center mt-4">
            <Button onClick={clearFile}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>Tailoring Score: {analysisResult.tailoringScore}/100</CardTitle>
                <p className="text-sm text-muted-foreground pt-1">{analysisResult.alignmentAnalysis}</p>
            </CardHeader>
        </Card>
        <div className="grid md:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-green-600"><ThumbsUp className="mr-2"/> Strong Matches</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                        {analysisResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-red-600"><ThumbsDown className="mr-2"/> Improvement Areas</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                        {analysisResult.improvementAreas.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-blue-600"><Lightbulb className="mr-2"/> Actionable Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {analysisResult.actionableSuggestions.map((s, i) => (
                    <div key={i}>
                        <h4 className={`font-semibold ${getPriorityColor(s.priority)}`}>
                            {s.category} (Priority: {s.priority})
                        </h4>
                        <ul className="list-disc pl-5 text-sm">
                            {s.items.map((item, j) => <li key={j}>{item}</li>)}
                        </ul>
                    </div>
                ))}
            </CardContent>
        </Card>
        <div className="text-center">
            <Button onClick={clearFile}>Analyze Another Resume</Button>
        </div>
    </div>
  );
}