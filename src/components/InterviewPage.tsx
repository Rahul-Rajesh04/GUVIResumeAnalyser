import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, MessageCircle, Send, Bot, User, CheckCircle, Star, TrendingUp, Brain } from 'lucide-react';

interface InterviewMessage {
  id: string;
  type: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
}

interface InterviewResult {
  score: number;
  feedback: {
    category: string;
    score: number;
    comment: string;
  }[];
  overallFeedback: string;
  suggestions: string[];
}

const interviewQuestions = [
  {
    id: 1,
    question: "Can you tell me about yourself and why you're interested in this role?",
    tips: "Focus on your relevant skills, experiences, and career goals. Keep it concise and professional."
  },
  {
    id: 2,  
    question: "Describe a challenging project you worked on. How did you approach it and what was the outcome?",
    tips: "Use the STAR method (Situation, Task, Action, Result) to structure your response."
  },
  {
    id: 3,
    question: "What are your greatest strengths and how do they relate to this position?",
    tips: "Choose strengths that are relevant to the role and provide specific examples."
  },
  {
    id: 4,
    question: "Where do you see yourself in 5 years?",
    tips: "Show ambition while aligning with the company's growth opportunities."
  }
];

export function InterviewPage() {
  const { state, navigateToPage } = useApp();
  const currentUser = state.currentUser;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);

  useEffect(() => {
    // Start with the first question
    if (messages.length === 0) {
      const firstMessage: InterviewMessage = {
        id: 'msg-0',
        type: 'interviewer',
        content: `Hello ${currentUser?.personalDetails.fullName || 'there'}! I'm your AI interviewer. I'll be asking you a few questions to help assess your interview skills. Are you ready to begin?`,
        timestamp: new Date()
      };
      
      setMessages([firstMessage]);
      
      // Add the first actual question after a delay
      setTimeout(() => {
        const questionMessage: InterviewMessage = {
          id: 'msg-1',
          type: 'interviewer',
          content: interviewQuestions[0].question,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, questionMessage]);
      }, 1500);
    }
  }, [currentUser]);

  const handleSendAnswer = () => {
    if (!currentAnswer.trim()) return;

    // Add candidate's answer to messages
    const answerMessage: InterviewMessage = {
      id: `msg-${Date.now()}`,
      type: 'candidate',
      content: currentAnswer,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, answerMessage]);
    setCurrentAnswer('');
    setIsProcessing(true);

    // Simulate AI processing time
    setTimeout(() => {
      setIsProcessing(false);
      
      if (currentQuestionIndex < interviewQuestions.length - 1) {
        // Move to next question
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        
        const nextQuestionMessage: InterviewMessage = {
          id: `msg-${Date.now() + 1}`,
          type: 'interviewer',
          content: interviewQuestions[nextIndex].question,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, nextQuestionMessage]);
      } else {
        // Interview completed
        const completionMessage: InterviewMessage = {
          id: `msg-final`,
          type: 'interviewer',
          content: "Thank you for completing the interview! I'm now analyzing your responses and will provide detailed feedback shortly.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        setInterviewCompleted(true);
        
        // Generate mock results
        setTimeout(() => {
          generateInterviewResults();
        }, 2000);
      }
    }, 1500);
  };

  const generateInterviewResults = () => {
    const mockResult: InterviewResult = {
      score: 82,
      feedback: [
        {
          category: "Communication Skills",
          score: 85,
          comment: "Clear and articulate responses with good structure. Consider adding more specific examples."
        },
        {
          category: "Technical Knowledge", 
          score: 80,
          comment: "Demonstrated solid understanding of technical concepts. Could benefit from deeper explanations."
        },
        {
          category: "Problem Solving",
          score: 78,
          comment: "Good approach to problem-solving scenarios. Try to elaborate more on your thought process."
        },
        {
          category: "Enthusiasm & Fit",
          score: 85,
          comment: "Showed genuine interest in the role and company. Passion comes through clearly."
        }
      ],
      overallFeedback: "Overall, this was a solid interview performance. You demonstrated good communication skills and technical knowledge. Your responses were well-structured and showed enthusiasm for the role. Focus on providing more specific examples and quantifying your achievements to make an even stronger impression.",
      suggestions: [
        "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions",
        "Prepare specific examples that demonstrate your key skills with quantifiable results",
        "Research the company more deeply to show genuine interest and cultural fit",
        "Work on confident body language and maintaining eye contact during virtual interviews",
        "Prepare thoughtful questions to ask the interviewer about the role and company"
      ]
    };

    setResult(mockResult);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendAnswer();
    }
  };

  if (!currentUser) return null;

  if (result) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigateToPage('dashboard')}
                className="btn-ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Interview Results</h1>
                <p className="text-muted-foreground">Your performance analysis and improvement suggestions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 max-w-4xl">
          {/* Overall Score */}
          <Card className="card-elevated p-8 text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h2 className="text-3xl font-bold text-foreground mb-2">Interview Complete!</h2>
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(result.score)}`}>
              {result.score}/100
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-6 h-6 ${
                    i < Math.floor(result.score / 20) 
                      ? 'text-warning fill-warning' 
                      : 'text-muted-foreground'
                  }`} 
                />
              ))}
            </div>
            
            <p className="text-lg text-muted-foreground">
              {result.score >= 80 ? 'Excellent Performance!' :
               result.score >= 60 ? 'Good Performance' : 'Room for Improvement'}
            </p>
          </Card>

          {/* Detailed Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {result.feedback.map((feedback, index) => (
              <Card key={index} className="card-elevated p-6 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{feedback.category}</h3>
                  <Badge variant="secondary" className={getScoreColor(feedback.score)}>
                    {feedback.score}/100
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{feedback.comment}</p>
              </Card>
            ))}
          </div>

          {/* Overall Feedback */}
          <Card className="card-elevated p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Overall Feedback</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">{result.overallFeedback}</p>
          </Card>

          {/* Improvement Suggestions */}
          <Card className="card-elevated p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Suggestions for Improvement</h3>
            </div>
            <div className="space-y-3">
              {result.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground">{suggestion}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => {
                setMessages([]);
                setCurrentQuestionIndex(0);
                setInterviewCompleted(false);
                setResult(null);
              }}
              variant="outline"
              className="btn-ghost"
            >
              Practice Again
            </Button>
            
            <Button
              onClick={() => navigateToPage('resume-analyzer')}
              className="btn-accent"
            >
              Improve Resume
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigateToPage('dashboard')}
                className="btn-ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mock Interview Simulator</h1>
                <p className="text-muted-foreground">Practice with AI and get performance feedback</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Question Progress</div>
              <div className="font-semibold">
                {Math.min(currentQuestionIndex + 1, interviewQuestions.length)} / {interviewQuestions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="card-elevated h-[60vh] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.type === 'candidate' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type === 'interviewer' && (
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.type === 'candidate'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted/50 text-foreground'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.type === 'candidate' 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {message.type === 'candidate' && (
                      <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-accent" />
                      </div>
                    )}
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-xs text-muted-foreground ml-2">AI is analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              {!interviewCompleted && (
                <div className="border-t border-border p-4">
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      placeholder="Type your answer here..."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-muted/30"
                      disabled={isProcessing}
                    />
                    <Button
                      onClick={handleSendAnswer}
                      disabled={!currentAnswer.trim() || isProcessing}
                      className="btn-hero"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Question Tips Panel */}
          <div className="lg:col-span-1">
            <Card className="card-elevated p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Interview Tips</h3>
              </div>

              {currentQuestionIndex < interviewQuestions.length && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-foreground">Current Question:</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {interviewQuestions[currentQuestionIndex]?.question}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-foreground">Tip:</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {interviewQuestions[currentQuestionIndex]?.tips}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="font-medium text-sm mb-3 text-foreground">General Tips:</h4>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• Take your time to think before answering</p>
                  <p>• Use specific examples from your experience</p>
                  <p>• Ask clarifying questions if needed</p>
                  <p>• Show enthusiasm and genuine interest</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}