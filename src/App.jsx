/* src/App.jsx */
import axios from "axios";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/ui/LoginPage";
import SignUpPage from "./components/ui/SignUpPage";
import Navbar from "./components/ui/Navbar";
import Dashboard from "./components/ui/Dashboard";
import VideoPlayer from "./components/ui/VideoPlayer";
import VideoUpload from "./components/ui/VideoUpload";
import UserProfile from "./components/ui/UserProfile";
import PrivateRoute from "./components/ui/PrivateRoute"; // ✅ Certifique-se de ter isso criado
import TrilhasPage from "./components/ui/TrilhasPage"; // ✅ Adicionando o componente da rota
import TrilhaPage from "./components/ui/TrilhaPage"; // ✅ Nova página da trilha
import TrilhasForm from "./components/ui/TrilhasForm";
import TrilhaPreviewModal from "./components/ui/TrilhaPreviewModal";
import ForgotPassword from "./components/ui/ForgotPassword"; // ajuste o caminho conforme seu projeto
import ResetPassword from "./components/ui/ResetPassword"; // ajuste o caminho conforme seu projeto
import CartaoVirtualPage from "./components/ui/CartaoVirtualPage";
import AgendaEventosPage from "./components/ui/AgendaEventosPage";
import EntrevistaSimuladaPage from "./components/ui/EntrevistaSimuladaPage";
import VideoPitchPage from "./components/ui/VideoPitchPage";
import MeusTestesPage from "./components/ui/MeusTestesPage";
import TesteDISCPage from "./components/ui/TesteDISCPage";
import CRMPage from "./components/ui/CRMPage";
import RecrutamentoPage from "./components/ui/RecrutamentoPage";
import TrilhaDetalhes from "@/components/ui/TrilhaDetalhes";
import VagasPage from './components/ui/VagasPage'; // Importando a nova página de
import CompanyPage from "./components/ui/CompanyPage";
import LoginModal from "./components/ui/LoginModal";
import MinhasCandidaturasPage from "./components/ui/MinhasCandidaturasPage";
<<<<<<< HEAD
import DetalhesPage from './components/ui/DetalhesVaga';
=======
import DetalhesVaga from "./components/ui/DetalhesVaga";
>>>>>>> origin/dev1
import "./App.css";

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


  useEffect(() => {
    if (!accessToken) return;
    axios
    axios.get(`${API_URL}/api/videos`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => {
        setTrilhas(res.data);
      })
      .catch((err) => {
        console.error("Erro ao buscar trilhas:", err.response || err);
      });
  }, [accessToken]);

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
        onAccess={(t) => {
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

// Componente principal com roteamento
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Página inicial = Login */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Página de Perfil */}
          <Route path="/profile" element={<UserProfile />} />

          {/* Página de detatlhes das vagas */}
          <Route path="/vagas/:vagaId" element={<DetalhesVaga />} />

          {/* Página de Perfil */}
          <Route path="/profile" element={<UserProfile />} />

          {/* Página de Empresas */}
          <Route path="/empresa/:id" element={<CompanyPage />} />

          {/* Página de Vagas */}
          <Route path="/vagas" element={<VagasPage />} />
          
          {/* Página de Detalhes das vagas */}
          <Route path="/vaga/:id" element={<DetalhesPage />} />

          {/* Página de Candidaturas */}
          <Route path="/minhas-candidaturas" element={<MinhasCandidaturasPage />} />

          {/* Página de Candidatura */}
          <Route path="/LoginModal" element={<LoginModal />} />

          {/* Página de cadastro */}
          <Route path="/signup" element={<SignUpPage />} />

          {/* Página de dashboard, protegida por autenticação */}
          <Route path="/dashboard" element={<PrivateRoute><AppContent /></PrivateRoute>} />

          {/* Página da trilha */}
          <Route path="/trilha/:id" element={<PrivateRoute><TrilhaPage /></PrivateRoute>} />

          {/* Páginas dos Aplicativos */}
          <Route path="/cartao-virtual" element={<PrivateRoute><CartaoVirtualPage /> </PrivateRoute>} />
          <Route path="/agenda-eventos" element={<PrivateRoute> <AgendaEventosPage /> </PrivateRoute>} />
          <Route path="/entrevista-simulada" element={<PrivateRoute><EntrevistaSimuladaPage /></PrivateRoute>} />
          <Route path="/video-pitch" element={<PrivateRoute><VideoPitchPage /></PrivateRoute>} />
          <Route path="/meus-testes" element={<PrivateRoute><MeusTestesPage /></PrivateRoute>} />
          <Route path="/teste-disc" element={<PrivateRoute><TesteDISCPage /></PrivateRoute>} />

          {/* Páginas CRM e Recrutamento */}
          <Route path="/crm" element={<PrivateRoute><CRMPage /></PrivateRoute>} />
          <Route path="/recrutamento" element={<PrivateRoute><RecrutamentoPage /></PrivateRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Catch-all: redireciona para "/" */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>{" "}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
