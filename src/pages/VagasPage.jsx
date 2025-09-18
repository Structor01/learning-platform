// src/components/ui/VagasPage.jsx - Página de todas as vagas
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  MapPin,
  Clock,
  Building2,
  Users,
  ExternalLink,
  Briefcase,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LoginModal from "./LoginModal";
import { API_URL } from "../components/utils/api";
import Navbar from "../components/ui/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "../components/ui/Notification";
import BotaoCandidatura from "../components/ui/BotaoCandidatura";
import BotaoInteresse from "../components/ui/BotaoInteresse";
import { Heart } from "lucide-react"; // Adicione o Heart nos imports do lucide-react

const VagasPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, signup } = useAuth();
  const { showNotification, NotificationComponent } = useNotification();

  // Estados principais
  const [vagas, setVagas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedVaga, setSelectedVaga] = useState(null);
  const [userCandidaturas, setUserCandidaturas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [selectedCidade, setSelectedCidade] = useState("");
  const [selectedModalidade, setSelectedModalidade] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Estados para opções de filtro
  const [cidades, setCidades] = useState([]);
  const [modalidades, setModalidades] = useState([]);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [vagasPorPagina] = useState(15);

  // Buscar todas as vagas e empresas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("🔍 Carregando todas as vagas e empresas");

        // Buscar todas as vagas
        console.log("💼 Buscando vagas:", `${API_URL}/api/recruitment/jobs`);
        const vagasResponse = await axios.get(
          `${API_URL}/api/recruitment/jobs`
        );
        console.log("✅ Vagas carregadas:", vagasResponse.data);
        setVagas(vagasResponse.data);

        // Buscar todas as empresas
        console.log("🏢 Buscando empresas:", `${API_URL}/api/companies`);
        const empresasResponse = await axios.get(`${API_URL}/api/companies`);
        console.log("✅ Empresas carregadas:", empresasResponse.data);
        setEmpresas(empresasResponse.data);

        // Extrair opções únicas para filtros
        const cidadesUnicas = [
          ...new Set(
            vagasResponse.data.map((vaga) => vaga.cidade).filter(Boolean)
          ),
        ];
        const modalidadesUnicas = [
          ...new Set(
            vagasResponse.data.map((vaga) => vaga.modalidade).filter(Boolean)
          ),
        ];

        setCidades(cidadesUnicas);
        setModalidades(modalidadesUnicas);
      } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
        showNotification({
          type: "error",
          title: "Erro ao carregar",
          message: "Não foi possível carregar as vagas. Tente novamente.",
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Buscar candidaturas do usuário
  useEffect(() => {
    const fetchUserCandidaturas = async () => {
      if (isAuthenticated && user?.id) {
        try {
          console.log("🔍 Buscando candidaturas para usuário:", user.id);
          const response = await axios.get(
            `${API_URL}/api/candidaturas/usuario/${user.id}`
          );
          setUserCandidaturas(response.data);
          console.log("✅ Candidaturas carregadas:", response.data);
        } catch (error) {
          console.error("❌ Erro ao buscar candidaturas:", error);
        }
      } else {
        setUserCandidaturas([]);
      }
    };

    fetchUserCandidaturas();
  }, [isAuthenticated, user?.id]);

  // Função para filtrar vagas
  const vagasFiltradas = vagas.filter((vaga) => {
    const matchSearch =
      !searchTerm ||
      vaga.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchEmpresa =
      !selectedEmpresa || vaga.empresa_id?.toString() === selectedEmpresa;
    const matchCidade = !selectedCidade || vaga.cidade === selectedCidade;
    const matchModalidade =
      !selectedModalidade || vaga.modalidade === selectedModalidade;

    return matchSearch && matchEmpresa && matchCidade && matchModalidade;
  });

  // Cálculos de paginação
  const totalPaginas = Math.ceil(vagasFiltradas.length / vagasPorPagina);
  const indiceInicial = (currentPage - 1) * vagasPorPagina;
  const indiceFinal = indiceInicial + vagasPorPagina;
  const vagasPaginadas = vagasFiltradas.slice(indiceInicial, indiceFinal);

  // Reset da página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEmpresa, selectedCidade, selectedModalidade]);

  // Função para obter nome da empresa
  const getEmpresaName = (empresaId) => {
    const empresa = empresas.find((e) => e.id === empresaId);
    return empresa?.name || "Empresa";
  };

  // Handlers de autenticação
  const handleLogin = async (loginData) => {
    try {
      await login(loginData.email, loginData.password);
      setShowLoginModal(false);
      console.log("✅ Login realizado via AuthContext");
    } catch (error) {
      console.error("Erro detalhado:", error);
      alert(`❌ Erro no login: ${error.message}`);
    }
  };

  const handleSignup = async (signupData) => {
    try {
      await signup({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
      });
      setShowLoginModal(false);
      console.log("✅ Cadastro realizado via AuthContext");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert(`❌ Erro no cadastro: ${error.message}`);
    }
  };

  // Handler para candidatura
  const handleEnviarCandidatura = async (vaga) => {
    if (isSubmitting) {
      console.log("⏳ Já enviando candidatura, ignorando clique...");
      return;
    }
    setIsSubmitting(true);

    try {
      console.log("🔄 Enviando candidatura:", {
        usuario_id: user.id,
        vaga_id: vaga.id,
        vaga_nome: vaga.nome,
      });

      const response = await axios.post(`${API_URL}/api/candidaturas`, {
        usuario_id: user.id,
        vaga_id: vaga.id,
        mensagem: `Candidatura para a vaga: ${vaga.nome}`,
      });

      console.log("✅ Candidatura enviada:", response.data);
      setUserCandidaturas((prev) => [...prev, response.data]);

      showNotification({
        type: "success",
        title: "Candidatura Enviada!",
        message: `Sua candidatura para ${vaga.nome} foi enviada com sucesso.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("❌ Erro ao enviar candidatura:", error);

      if (error.response?.status === 409) {
        showNotification({
          type: "info",
          title: "Candidatura Existente",
          message: `Você já se candidatou para a vaga: ${vaga.nome}`,
          duration: 4000,
        });

        // Recarregar candidaturas
        if (isAuthenticated && user?.id) {
          try {
            const response = await axios.get(
              `${API_URL}/api/candidaturas/usuario/${user.id}`
            );
            setUserCandidaturas(response.data);
          } catch (reloadError) {
            console.error("Erro ao recarregar candidaturas:", reloadError);
          }
        }
      } else {
        showNotification({
          type: "error",
          title: "Erro ao candidatar",
          message: "Não foi possível enviar sua candidatura. Tente novamente.",
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCandidatar = (vaga) => {
    setSelectedVaga(vaga);

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (jaSeCandidata(vaga.id)) {
      showNotification({
        type: "info",
        title: "Candidatura Existente",
        message: `Você já se candidatou para a vaga: ${vaga.nome}`,
        duration: 4000,
      });
      return;
    }

    handleEnviarCandidatura(vaga);
  };

  const jaSeCandidata = (vagaId) => {
    const vagaIdNum = parseInt(vagaId);
    const vagaIdStr = String(vagaId);

    return userCandidaturas.some((candidatura) => {
      const candidaturaVagaId = candidatura.vaga_id;
      return (
        candidaturaVagaId === vagaIdNum ||
        candidaturaVagaId === vagaIdStr ||
        parseInt(candidaturaVagaId) === vagaIdNum
      );
    });
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedEmpresa("");
    setSelectedCidade("");
    setSelectedModalidade("");
    setCurrentPage(1);
  };

  // Funções de paginação
  const handlePageChange = (novaPagina) => {
    setCurrentPage(novaPagina);
    // Scroll suave para o topo da lista de vagas
    document
      .getElementById("vagas-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPaginas) {
      handlePageChange(currentPage + 1);
    }
  };

  // Gerar números das páginas para exibir
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5; // Máximo de números de página visíveis

    if (totalPaginas <= maxVisible) {
      // Se tem poucas páginas, mostra todas
      for (let i = 1; i <= totalPaginas; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Lógica para páginas com reticências
      if (currentPage <= 3) {
        // Início: 1, 2, 3, 4, ..., last
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        if (totalPaginas > 5) {
          pageNumbers.push("...");
          pageNumbers.push(totalPaginas);
        }
      } else if (currentPage >= totalPaginas - 2) {
        // Fim: 1, ..., last-3, last-2, last-1, last
        pageNumbers.push(1);
        if (totalPaginas > 5) {
          pageNumbers.push("...");
        }
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Meio: 1, ..., current-1, current, current+1, ..., last
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPaginas);
      }
    }

    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar
          currentView="vagas"
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
                Carregando vagas
              </h3>
              <p className="text-gray-400">
                Buscando todas as oportunidades disponíveis...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar
        currentView="vagas"
        onViewChange={(view) => console.log("View changed:", view)}
        onAddTrilha={() => console.log("Add trilha")}
      />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
              <div className="text-center space-y-6 lg:space-y-8 mb-12">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-orange-500/20">
                    <Briefcase className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-200 font-medium text-sm">
                      Oportunidades de Carreira
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                    Todas as Vagas
                  </h1>

                  <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                    Explore todas as oportunidades disponíveis e encontre a vaga
                    ideal para sua carreira no agronegócio
                  </p>
                </div>

                <div className="bg-orange-600/20 text-orange-400 px-6 py-3 rounded-full border border-orange-600/30 inline-flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  <span className="font-semibold">
                    {vagasFiltradas.length} vaga
                    {vagasFiltradas.length !== 1 ? "s" : ""} encontrada
                    {vagasFiltradas.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filtros e Busca */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-900/80 backdrop-blur border-gray-800 rounded-2xl shadow-lg p-6 border">
            {/* Barra de busca */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, descrição ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Toggle de filtros */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filtros
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Botão limpar filtros */}
              {(selectedEmpresa || selectedCidade || selectedModalidade) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Filtros expandidos */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Empresa
                  </label>
                  <select
                    value={selectedEmpresa}
                    onChange={(e) => setSelectedEmpresa(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Todas as empresas</option>
                    {empresas.map((empresa) => (
                      <option key={empresa.id} value={empresa.id.toString()}>
                        {empresa.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cidade
                  </label>
                  <select
                    value={selectedCidade}
                    onChange={(e) => setSelectedCidade(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Todas as cidades</option>
                    {cidades.map((cidade) => (
                      <option key={cidade} value={cidade}>
                        {cidade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Modalidade
                  </label>
                  <select
                    value={selectedModalidade}
                    onChange={(e) => setSelectedModalidade(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Todas as modalidades</option>
                    {modalidades.map((modalidade) => (
                      <option key={modalidade} value={modalidade}>
                        {modalidade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Lista de Vagas */}
        <section
          id="vagas-section"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
        >
          {/* Informações da página atual */}
          {vagasFiltradas.length > 0 && (
            <div className="mb-6 text-center">
              <p className="text-gray-400 text-sm">
                Mostrando {indiceInicial + 1} -{" "}
                {Math.min(indiceFinal, vagasFiltradas.length)} de{" "}
                {vagasFiltradas.length} vagas
                {totalPaginas > 1 && (
                  <span className="ml-2">
                    • Página {currentPage} de {totalPaginas}
                  </span>
                )}
              </p>
            </div>
          )}

          {vagasPaginadas.length > 0 ? (
            <>
              <div className="space-y-6 lg:space-y-8">
                {vagasPaginadas.map((vaga) => (
                  <article
                    key={vaga.id}
                    className="bg-gray-900/80 backdrop-blur border-gray-800 rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 hover:bg-gray-800/80 transition-all duration-300 border hover:border-gray-700"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <header className="mb-6">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <h3 className="text-xl sm:text-2xl font-bold text-white line-clamp-2 flex-1">
                              {vaga.title || vaga.nome}
                            </h3>
                            <button
                              onClick={() =>
                                navigate(`/empresa/${vaga.empresa_id}`)
                              }
                              className="bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-medium hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-200 border border-orange-500/20 hover:border-orange-500/30 flex-shrink-0"
                            >
                              {getEmpresaName(vaga.empresa_id)}
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              <span>
                                {vaga.location || `${vaga.cidade}, ${vaga.uf}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <span>{vaga.job_type || vaga.modalidade}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Building2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{vaga.company || vaga.local}</span>
                            </div>
                          </div>
                        </header>

                        {/* Prévia da descrição */}
                        {(vaga.description || vaga.descricao) && (
                          <div className="mb-4">
                            <p className="text-gray-300 leading-relaxed line-clamp-3">
                              {vaga.description || vaga.descricao}
                            </p>
                          </div>
                        )}
                      </div>
                      {/* Botões de ação */}
                      <div className="xl:w-50 flex-shrink-0 space-y-3">
                        {/* Container para botão de interesse e candidatura */}
                        <div className="flex gap-3">
                          {/* Botão de Interesse - Só aparece para vagas externas */}
                          {vaga.tipo === "externa" && (
                            <BotaoInteresse
                              vaga={vaga}
                              isAuthenticated={isAuthenticated}
                              user={user}
                              onLoginRequired={() => setShowLoginModal(true)}
                              showNotification={showNotification}
                            />
                          )}

                          {/* Botão de candidatura - Só aparece para vagas internas */}
                          {vaga.tipo === "interna" && (
                            <div className="flex-1">
                              <BotaoCandidatura
                                vaga={vaga}
                                isAuthenticated={isAuthenticated}
                                isSubmitting={isSubmitting}
                                jaSeCandidata={jaSeCandidata}
                                handleCandidatar={handleCandidatar}
                              />
                            </div>
                          )}
                        </div>

                        {/* Botão de detalhes - Sempre aparece */}
                        <button
                          onClick={() => navigate(`/vagas/${vaga.id}`)}
                          className="w-full px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Detalhes
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Componente de Paginação */}
              {totalPaginas > 1 && (
                <div className="mt-12 flex flex-col items-center space-y-4">
                  {/* Navegação de páginas */}
                  <div className="flex items-center justify-center space-x-2">
                    {/* Botão Anterior */}
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        currentPage === 1
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Números das páginas */}
                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((pageNum, index) => (
                        <React.Fragment key={index}>
                          {pageNum === "..." ? (
                            <span className="px-3 py-2 text-gray-500">...</span>
                          ) : (
                            <button
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                              }`}
                            >
                              {pageNum}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Botão Próximo */}
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPaginas}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        currentPage === totalPaginas
                          ? "text-gray-600 cursor-not-allowed"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Navegação rápida */}
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Ir para página:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max={totalPaginas}
                        value={currentPage}
                        onChange={(e) => {
                          const pagina = parseInt(e.target.value);
                          if (pagina >= 1 && pagina <= totalPaginas) {
                            handlePageChange(pagina);
                          }
                        }}
                        className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="text-gray-500">de {totalPaginas}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 sm:py-20">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                {searchTerm ||
                selectedEmpresa ||
                selectedCidade ||
                selectedModalidade
                  ? "Nenhuma vaga encontrada"
                  : "Nenhuma vaga disponível"}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8 px-4">
                {searchTerm ||
                selectedEmpresa ||
                selectedCidade ||
                selectedModalidade
                  ? "Tente ajustar os filtros ou buscar por outros termos."
                  : "Não há vagas cadastradas no momento. Volte em breve para verificar novas oportunidades."}
              </p>
              {(searchTerm ||
                selectedEmpresa ||
                selectedCidade ||
                selectedModalidade) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium flex items-center gap-2 mx-auto"
                >
                  <X className="w-4 h-4" />
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
      {NotificationComponent}
    </div>
  );
};

export default VagasPage;
