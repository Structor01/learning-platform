// src/components/ui/DetalhesPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Building2,
  Users,
  ExternalLink,
  Briefcase,
  Globe,
  ChevronRight,
} from "lucide-react";
import LoginModal from "./LoginModal";
import { API_URL } from "../utils/api";
import Navbar from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import CompanyPage from "./CompanyPage";

const DetalhesPage = () => {
  const { id: vagaId } = useParams();
  const navigate = useNavigate();
  const { user, accessToken, login, signup } = useAuth();

  const [vaga, setVaga] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userCandidaturas, setUserCandidaturas] = useState([]);

  // Verificar se usuário está logado - usando AuthContext
  const isUserLoggedIn = !!user && !!accessToken;

  // Buscar dados da vaga
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar dados da vaga
        const vagaResponse = await axios.get(`${API_URL}/api/vagas/${vagaId}`);
        setVaga(vagaResponse.data);

        // Buscar dados da empresa relacionada à vaga
        if (vagaResponse.data.empresa_id) {
          const companyResponse = await axios.get(
            `${API_URL}/api/companies/${vagaResponse.data.empresa_id}`
          );
          setCompany(companyResponse.data);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vagaId]);

  // Buscar candidaturas do usuário - usando AuthContext
  useEffect(() => {
    const fetchUserCandidaturas = async () => {
      if (isUserLoggedIn && user?.id) {
        try {
          const response = await axios.get(
            `${API_URL}/api/candidaturas/usuario/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          setUserCandidaturas(response.data);
          console.log("📋 Candidaturas do usuário:", response.data);
        } catch (error) {
          console.error("Erro ao buscar candidaturas:", error);
        }
      }
    };

    fetchUserCandidaturas();
  }, [isUserLoggedIn, user, accessToken]);

  // Usar função de login do AuthContext
  const handleLogin = async (loginData) => {
    try {
      await login(loginData.email, loginData.password);
      setShowLoginModal(false);
      console.log("✅ Login realizado:", user?.name);
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  // Usar função de signup do AuthContext
  const handleSignup = async (signupData) => {
    try {
      await signup({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
      });
      setShowLoginModal(false);
      console.log("✅ Cadastro realizado:", user?.name);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      throw error;
    }
  };

  const handleEnviarCandidatura = async (vaga) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/candidaturas`,
        {
          usuario_id: user.id,
          vaga_id: vaga.id,
          mensagem: `Candidatura para a vaga: ${vaga.nome}`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Adicionar na lista local
      setUserCandidaturas((prev) => [...prev, response.data]);

      alert(`✅ Candidatura enviada com sucesso para: ${vaga.nome}`);
    } catch (error) {
      console.error("Erro ao enviar candidatura:", error);
      alert("❌ Erro ao enviar candidatura. Tente novamente.");
    }
  };

  const handleCandidatar = (vaga) => {
    if (!isUserLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // Verificar se já se candidatou
    if (jaSeCandidata(vaga.id)) {
      alert(
        `✅ Você já se candidatou para a vaga: ${vaga.nome}\n\nSua candidatura já está registrada!`
      );
      return;
    }

    handleEnviarCandidatura(vaga);
  };

  const jaSeCandidata = (vagaId) => {
    return userCandidaturas.some(
      (candidatura) => candidatura.vaga_id === vagaId
    );
  };

  const handleVoltarEmpresa = () => {
    if (company?.id) {
      navigate(`/empresa/${company.id}`);
    } else {
      navigate("/vagas");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar
          currentView="detalhes"
          onViewChange={(view) => console.log("View changed:", view)}
          onAddTrilha={() => console.log("Add trilha")}
        />

        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="relative mx-auto mb-8 w-16 h-16">
                <div className="w-16 h-16 border-4 border-gray-700 border-t-orange-600 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-500 rounded-full animate-spin"
                  style={{ animationDirection: "reverse" }}
                ></div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Carregando detalhes da vaga
              </h3>
              <p className="text-gray-400">Buscando informações completas...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!vaga) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar
          currentView="detalhes"
          onViewChange={(view) => console.log("View changed:", view)}
          onAddTrilha={() => console.log("Add trilha")}
        />

        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                Vaga não encontrada
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8 px-4">
                A vaga que você está procurando não foi encontrada ou pode ter
                sido removida.
              </p>
              <button
                onClick={() => navigate("/vagas")}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Ver todas as vagas
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <Navbar
        currentView="detalhes"
        onViewChange={(view) => console.log("View changed:", view)}
        onAddTrilha={() => console.log("Add trilha")}
      />

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section da Vaga */}
        <section className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
            {/* Gradient Overlays */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
              {/* Navigation */}
              <div className="mb-8 sm:mb-12">
                <button
                  onClick={handleVoltarEmpresa}
                  className="group flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/10 border border-white/10"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="font-medium">
                    {company ? `Voltar para ${company.name}` : "Voltar"}
                  </span>
                </button>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
                {/* Left Column - Job Info */}
                <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                  {/* Job Header */}
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-500/20">
                      <Briefcase className="w-5 h-5 text-orange-400" />
                      <span className="text-orange-200 font-medium text-sm">
                        Oportunidade de Emprego
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                      {vaga.nome}
                    </h1>

                    {company && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <span className="text-lg text-gray-300 font-medium">
                          {company.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-semibold">
                          Localização
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {vaga.cidade}, {vaga.uf}
                      </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-green-400" />
                        <span className="text-white font-semibold">
                          Modalidade
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{vaga.modalidade}</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-purple-400" />
                        <span className="text-white font-semibold">Local</span>
                      </div>
                      <p className="text-gray-300 text-sm">{vaga.local}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Action Button */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <button
                        onClick={() => handleCandidatar(vaga)}
                        className={`w-full px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 mb-4 ${
                          isUserLoggedIn && jaSeCandidata(vaga.id)
                            ? "bg-gray-600 cursor-not-allowed text-gray-300"
                            : "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 hover:-translate-y-0.5"
                        }`}
                        disabled={isUserLoggedIn && jaSeCandidata(vaga.id)}
                      >
                        {!isUserLoggedIn ? (
                          <>
                            <ExternalLink className="w-5 h-5" />
                            Fazer login para candidatar-se
                          </>
                        ) : jaSeCandidata(vaga.id) ? (
                          <>
                            <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                              <span className="text-xs">✓</span>
                            </div>
                            Candidatura enviada
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-5 h-5" />
                            Candidatar-se agora
                          </>
                        )}
                      </button>

                      {isUserLoggedIn && jaSeCandidata(vaga.id) && (
                        <p className="text-xs text-green-400 text-center">
                          Sua candidatura foi registrada com sucesso
                        </p>
                      )}

                      {vaga.remuneracao && (
                        <div className="mt-4 p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
                          <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            Remuneração
                          </h4>
                          <p className="text-green-300 font-semibold">
                            {vaga.remuneracao}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Detalhes da Vaga */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna principal com detalhes - Card único */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900/80 backdrop-blur border-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 border">
                <div className="space-y-8">
                  {vaga.descricao && (
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-orange-400" />
                        </div>
                        Descrição da Vaga
                      </h2>
                      <div className="prose max-w-none">
                        <p className="text-base sm:text-lg text-gray-300 leading-relaxed whitespace-pre-line">
                          {vaga.descricao}
                        </p>
                      </div>
                    </div>
                  )}

                  {vaga.criterios && (
                    <div className="pt-8 border-t border-gray-800">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-400" />
                        </div>
                        Requisitos e Critérios
                      </h2>
                      <div className="prose max-w-none">
                        <p className="text-base sm:text-lg text-gray-300 leading-relaxed whitespace-pre-line">
                          {vaga.criterios}
                        </p>
                      </div>
                    </div>
                  )}

                  {vaga.beneficios && (
                    <div className="pt-8 border-t border-gray-800">
                      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-green-400 font-bold text-sm">
                            ★
                          </span>
                        </div>
                        Benefícios Oferecidos
                      </h2>
                      <div className="prose max-w-none">
                        <p className="text-base sm:text-lg text-gray-300 leading-relaxed whitespace-pre-line">
                          {vaga.beneficios}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar com informações da empresa */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {company && (
                  <div className="bg-gray-900/80 backdrop-blur border-gray-800 rounded-2xl shadow-lg p-6 border">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-orange-400" />
                      Sobre a Empresa
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          {company.name}
                        </h4>
                        {company.obs && (
                          <p className="text-gray-400 text-sm line-clamp-3">
                            {company.obs}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/empresa/${company.id}`)}
                        className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
                      >
                        Ver perfil da empresa
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Informações adicionais */}
                <div className="bg-gray-900/80 backdrop-blur border-gray-800 rounded-2xl shadow-lg p-6 border">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Informações da Vaga
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-gray-400">Localização</span>
                      <span className="text-white font-medium">
                        {vaga.cidade}, {vaga.uf}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-800">
                      <span className="text-gray-400">Modalidade</span>
                      <span className="text-white font-medium">
                        {vaga.modalidade}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">Local</span>
                      <span className="text-white font-medium">
                        {vaga.local}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal de Login */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    </div>
  );
};

export default DetalhesPage;
