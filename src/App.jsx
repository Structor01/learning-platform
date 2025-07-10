import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage    from "./components/ui/LoginPage";
import SignUpPage   from "./components/ui/SignUpPage";
import Navbar       from "./components/ui/Navbar";
import Dashboard    from "./components/ui/Dashboard";
import VideoPlayer  from "./components/ui/VideoPlayer";
import VideoUpload  from "./components/ui/VideoUpload";
import UserProfile  from "./components/ui/UserProfile";
import "./App.css";

// Componente que gerencia as rotas privadas e a renderização principal
function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");
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
    // Se não estiver logado, redireciona para login
    return <Navigate to="/login" replace />;
  }

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCurrentView("video");
  };

  const handleSmartPlayerOpen = () => {
    setCurrentView("smartPlayer");
  };

  const handleVideoUploaded = (video) => {
    setSelectedCourse(video);
    setCurrentView("smartVideo");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedCourse(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            onCourseSelect={handleCourseSelect}
            onSmartPlayerOpen={handleSmartPlayerOpen}
          />
        );
      case "video":
        return selectedCourse ? (
          <VideoPlayer course={selectedCourse} onBack={handleBackToDashboard} />
        ) : null;
      case "smartPlayer":
        return (
          <VideoUpload
            onVideoUploaded={handleVideoUploaded}
            onBack={handleBackToDashboard}
          />
        );
      case "smartVideo":
        return selectedCourse ? (
          <VideoPlayer
            course={selectedCourse}
            onBack={() => setCurrentView("smartPlayer")}
            isSmartPlayer={true}
          />
        ) : null;
      case "profile":
        return <UserProfile />;
      default:
        return (
          <Dashboard
            onCourseSelect={handleCourseSelect}
            onSmartPlayerOpen={handleSmartPlayerOpen}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {currentView !== "video" && currentView !== "smartVideo" && (
        <Navbar currentView={currentView} onViewChange={setCurrentView} />
      )}
      {renderCurrentView()}
    </div>
  );
}

// Componente principal com roteamento
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Rota privada para o conteúdo principal */}
          <Route path="/*" element={<AppContent />} />

          {/* Qualquer outra rota */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
