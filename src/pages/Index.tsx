import React from 'react';
import { AppProvider, useApp } from '../contexts/AppContext';
import { WelcomePage } from '../components/WelcomePage';
import { ProfileWizard } from '../components/ProfileWizard';
import { DashboardPage } from '../components/DashboardPage';
import { RoadmapPage } from '../components/RoadmapPage';
import { ResumeAnalyzerPage } from '../components/ResumeAnalyzerPage';
import { InterviewPage } from '../components/InterviewPage';

function AppContent() {
  const { state } = useApp();
  
  const renderCurrentPage = () => {
    switch (state.currentPage) {
      case 'welcome':
        return <WelcomePage />;
      case 'wizard':
        return <ProfileWizard />;
      case 'dashboard':
        return <DashboardPage />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'resume-analyzer':
        return <ResumeAnalyzerPage />;
      case 'interview':
        return <InterviewPage />;
      default:
        return <WelcomePage />;
    }
  };

  return <div className="min-h-screen">{renderCurrentPage()}</div>;
}

const Index = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
