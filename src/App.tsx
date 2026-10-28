import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UploadMedia } from './pages/UploadMedia';
import { IndividualReport } from './pages/IndividualReport';
import { Alerts } from './pages/Alerts';
import { MediaGallery } from './pages/MediaGallery';
import { Analytics } from './pages/Analytics';
import { WorkerTrackAnalysis } from './pages/WorkerTrackAnalysis';
import { PolicySettings } from './pages/PolicySettings';
import { UserManagement } from './pages/UserManagement';
import { ProfileSettings } from './pages/ProfileSettings';
import { User, UserRole } from './types';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('safeguard_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string>('All');
  const [activeAlertCount, setActiveAlertCount] = useState<number>(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Poll alerts count periodically
  useEffect(() => {
    if (!currentUser) return;
    const fetchAlertsCount = async () => {
      try {
        const res = await api.getAlerts();
        setActiveAlertCount(res.activeCount);
      } catch (err) {
        // quiet error handling
      }
    };
    fetchAlertsCount();
    const interval = setInterval(fetchAlertsCount, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('safeguard_user', JSON.stringify(user));
    localStorage.setItem('safeguard_token', token);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    localStorage.removeItem('safeguard_user');
    localStorage.removeItem('safeguard_token');
  };

  const handleNavigateToReport = (analysisId: string) => {
    setSelectedReportId(analysisId);
    setCurrentTab('report');
  };

  // If not authenticated, render Login
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
        }}
        activeAlertCount={activeAlertCount}
        userName={currentUser.name}
        userRole={currentUser.role}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          selectedSite={selectedSite}
          onSelectSite={setSelectedSite}
          activeAlertCount={activeAlertCount}
          onQuickUpload={() => setCurrentTab('upload')}
          onOpenAlerts={() => setCurrentTab('alerts')}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-100/60">
          {currentTab === 'dashboard' && (
            <Dashboard
              selectedSite={selectedSite}
              onNavigateToReport={handleNavigateToReport}
              onNavigateToUpload={() => setCurrentTab('upload')}
              onNavigateToAlerts={() => setCurrentTab('alerts')}
            />
          )}

          {currentTab === 'upload' && (
            <UploadMedia
              onAnalysisComplete={handleNavigateToReport}
              defaultSite={selectedSite}
            />
          )}

          {currentTab === 'report' && (
            <IndividualReport
              analysisId={selectedReportId}
              onBackToDashboard={() => setCurrentTab('dashboard')}
              onBackToGallery={() => setCurrentTab('gallery')}
            />
          )}

          {currentTab === 'alerts' && (
            <Alerts
              onNavigateToReport={handleNavigateToReport}
              defaultSite={selectedSite}
            />
          )}

          {currentTab === 'gallery' && (
            <MediaGallery
              onSelectReport={handleNavigateToReport}
              onNavigateToUpload={() => setCurrentTab('upload')}
              defaultSite={selectedSite}
            />
          )}

          {currentTab === 'analytics' && (
            <Analytics defaultSite={selectedSite} />
          )}

          {currentTab === 'tracks' && (
            <WorkerTrackAnalysis onNavigateToReport={handleNavigateToReport} />
          )}

          {currentTab === 'policy' && <PolicySettings />}

          {currentTab === 'users' && <UserManagement />}

          {currentTab === 'profile' && (
            <ProfileSettings
              userName={currentUser.name}
              userRole={currentUser.role}
              userEmail={currentUser.email}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>
    </div>
  );
}
