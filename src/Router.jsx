import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./components/ui/LoginPage";
import EntrevistaSimuladaPage from "./pages/EntrevistaSimuladaPage";
import PublicChatPage from "./pages/PublicChatPage";
import UserProfile from "./pages/UserProfile";
import DetalhesVaga from "./pages/DetalhesVaga";
import CompanyPage from "./pages/CompanyPage";
import VagasPage from "./pages/VagasPage";
import PrivateRoute from "./components/ui/PrivateRoute";
import EmpresasPage from "./pages/EmpresasPage";
import MeusInteresses from "./pages/MeusInteresses";
import MinhasCandidaturasPage from "./pages/MinhasCandidaturasPage";
import InterviewPage from "./pages/InterviewPage";
import LoginModal from "./pages/LoginModal";
import SignUpPage from "./pages/SignUpPage";
import TrilhaPage from "./pages/TrilhaPage";
import CartaoVirtualPage from "./pages/CartaoVirtualPage";
import AgendaEventosPage from "./pages/AgendaEventosPage";
import VideoPitchPage from "./pages/VideoPitchPage";
import MeusTestesPage from "./components/ui/MeusTestesPage";
import TesteDISCPage from "./pages/TesteDISCPage";
import DISCProfilePage from "./pages/DISCProfilePage";
import CRMPage from "./pages/CRMPage";
import RecrutamentoPage from "./pages/RecrutamentoPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CandidaturasAdmPage from "./pages/CandidaturasAdmPage";
import CompanyDashboard from "./components/ui/CompanyDashboard";
import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import axios from "axios";
import Navbar from "./components/ui/Navbar";
import Dashboard from "./components/ui/Dashboard";
import VideoPlayer from "./components/ui/VideoPlayer";
import TrilhaPreviewModal from "./components/ui/TrilhaPreviewModal";
import TrilhasForm from "./components/ui/TrilhasForm";
import VideoUpload from "./components/ui/VideoUpload";
import NewsPage from "./pages/NewsPage";
import EventosPage from "./pages/EventosPage"

const getApiUrl = () => {
  // Se estiver em produção (hostname não é localhost)
  if (window.location.hostname !== 'localhost') {
    return 'https://learning-platform-backend-2x39.onrender.com';
  }
  // Senão, usa ambiente ou localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

const API_URL = getApiUrl();

// Componente que gerencia as rotas privadas e a renderização principal
function AppContent() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isAddTrilhaOpen, setIsAddTrilhaOpen] = useState(false);
  // === Estado global de trilhas ===
  const [trilhas, setTrilhas] = useState([]);

  const [previewTrilha, setPreviewTrilha] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { user, accessToken, isLoading } = useAuth();
  console.log("🔐 Auth user no AppContent:", user);


  // useEffect(() => {
  //   if (!accessToken) return;

  //   axios.get(`${API_URL}/api/videos`, {
  //     headers: { Authorization: `Bearer ${accessToken}` },
  //   })
  //     .then((res) => {
  //       setTrilhas(res.data);
  //     })
  //     .catch((err) => {
  //       console.error("Erro ao buscar trilhas:", err.response || err);
  //     });
  // }, [accessToken]);

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

  const handleCourseSelect = (course) => {
    // em vez de navegar para o vídeo,
    // guardamos a trilha e abrimos o modal de preview
    setPreviewTrilha(course);
    setIsPreviewOpen(true);
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
            trilhas={trilhas}
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
            trilhas={trilhas}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {currentView !== "video" && currentView !== "smartVideo" && (
        <Navbar
          currentView={currentView}
          onViewChange={setCurrentView}
          onAddTrilha={() => setIsAddTrilhaOpen(true)}
        />
      )}
      {renderCurrentView()}

      {/* Modal de Preview */}
      <TrilhaPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        trilha={previewTrilha}
        onAccess={() => {
          // futuramente navegar para a página de curso completo
          setIsPreviewOpen(false);
          // ex: navigate(`/trilha/${t.id}`)
        }}
      />

      {/* Modal de Adicionar Trilhas */}
      {isAddTrilhaOpen && (
        <TrilhasForm
          onClose={() => setIsAddTrilhaOpen(false)}
          //NESTTTT
          //onSubmit={(data) => {
          //console.log("Dados da nova trilha:", data);
          //setIsAddTrilhaOpen(false);
          // Aqui você pode chamar sua API NestJS para salvar
          //}}
          onSubmit={async (data) => {
            try {
              const formData = new FormData();
              formData.append("title", data.title);
              formData.append("description", data.description);
              formData.append("videoUrl", data.videoUrl);
              formData.append("coverHorizontal", data.coverHorizontal);

              const response = await axios.post(
                `${API_URL}/api/videos`,
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              const newTrilha = response.data;

              setTrilhas((prev) => [...prev, newTrilha]);
              setIsAddTrilhaOpen(false);
            } catch (err) {
              console.error("Erro ao salvar trilha:", err.response || err);
            }
          }}
        />
      )}
    </div>
  );
}


export function Router() {

  return (
    <BrowserRouter basename="/">
      <Routes>
        {/* Página inicial = Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Página de notícias */}
        <Route path="/news" element={<NewsPage />} />

        <Route path="/eventos" element={<EventosPage />} />

        {/* Página pública do chat */}
        <Route path="/chat" element={<PublicChatPage />} />

        {/* Página de Perfil */}
        <Route path="/profile" element={<UserProfile />} />

        {/* Página de detalhes das vagas */}
        <Route path="/vagas/:vagaId" element={<DetalhesVaga />} />

        {/* Página de Empresas */}
        <Route path="/empresa/:id" element={<CompanyPage />} />

        {/* Página de Vagas */}
        <Route path="/vagas" element={<VagasPage />} />

        {/* Página de Gestão de Empresas */}
        <Route path="/empresas" element={<PrivateRoute><EmpresasPage /></PrivateRoute>} />

        {/* Página de Meus Interesses */}
        <Route path="/meus-interesses" element={<MeusInteresses />} />

        {/* Página de Candidaturas */}
        <Route path="/minhas-candidaturas" element={<MinhasCandidaturasPage />} />

        {/* Página de Entrevista */}
        <Route path="/entrevista" element={<PrivateRoute><InterviewPage /></PrivateRoute>} />

        {/* Página de Login Modal */}
        <Route path="/LoginModal" element={<LoginModal />} />

        {/* Página de cadastro */}
        <Route path="/signup" element={<SignUpPage />} />

        {/* Página de dashboard, protegida por autenticação */}
        <Route path="/dashboard" element={<PrivateRoute><AppContent /></PrivateRoute>} />

        {/* Dashboard da empresa */}
        <Route path="/dashboard-empresa" element={<PrivateRoute><CompanyDashboard /></PrivateRoute>} />

        {/* Página da trilha */}
        <Route path="/trilha/:id" element={<PrivateRoute><TrilhaPage /></PrivateRoute>} />

        {/* Páginas dos Aplicativos - TODAS PROTEGIDAS */}
        <Route path="/cartao-virtual" element={<PrivateRoute><CartaoVirtualPage /></PrivateRoute>} />
        <Route path="/agenda-eventos" element={<PrivateRoute><AgendaEventosPage /></PrivateRoute>} />
        <Route path="/entrevista-simulada" element={<PrivateRoute><EntrevistaSimuladaPage /></PrivateRoute>} />
        <Route path="/video-pitch" element={<PrivateRoute><VideoPitchPage /></PrivateRoute>} />
        <Route path="/meus-testes" element={<PrivateRoute><MeusTestesPage /></PrivateRoute>} />
        <Route path="/teste-disc" element={<PrivateRoute><TesteDISCPage /></PrivateRoute>} />
        <Route path="/disc-profile" element={<PrivateRoute><DISCProfilePage /></PrivateRoute>} />

        {/* Páginas CRM, Recrutamento e Candidaturas */}
        <Route path="/crm" element={<PrivateRoute><CRMPage /></PrivateRoute>} />
        <Route path="/recrutamento" element={<PrivateRoute><RecrutamentoPage /></PrivateRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/candidaturas" element={<CandidaturasAdmPage />} />

        {/* Catch-all: redireciona para "/" */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}