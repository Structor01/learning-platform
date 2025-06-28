import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import VideoPlayer from './components/VideoPlayer';
import VideoUpload from './components/VideoUpload';
import UserProfile from './components/UserProfile';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCurrentView('video');
  };

  const handleSmartPlayerOpen = () => {
    setCurrentView('smartPlayer');
  };

  const handleVideoUploaded = (video) => {
    // Quando um vídeo é carregado, reproduzir no Smart Player
    setSelectedCourse(video);
    setCurrentView('smartVideo');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCourse(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onCourseSelect={handleCourseSelect} onSmartPlayerOpen={handleSmartPlayerOpen} />;
      case 'video':
        return selectedCourse ? (
          <VideoPlayer 
            course={selectedCourse} 
            onBack={handleBackToDashboard}
          />
        ) : null;
      case 'smartPlayer':
        return (
          <VideoUpload 
            onVideoUploaded={handleVideoUploaded}
            onBack={handleBackToDashboard}
          />
        );
      case 'smartVideo':
        return selectedCourse ? (
          <VideoPlayer 
            course={selectedCourse} 
            onBack={() => setCurrentView('smartPlayer')}
            isSmartPlayer={true}
          />
        ) : null;
      case 'profile':
        return <UserProfile />;
      default:
        return <Dashboard onCourseSelect={handleCourseSelect} onSmartPlayerOpen={handleSmartPlayerOpen} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {currentView !== 'video' && currentView !== 'smartVideo' && (
        <Navbar 
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      )}
      {renderCurrentView()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

