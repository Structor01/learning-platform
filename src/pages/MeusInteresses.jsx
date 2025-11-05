import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Heart,
  MapPin,
  Clock,
  Building2,
  ExternalLink,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Search,
  Briefcase,
} from "lucide-react";
import { API_URL } from "../components/utils/api";
import Navbar from "../components/ui/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "../components/ui/Notification";
import { Navigate } from "react-router-dom";

const MeusInteresses = () => {
  const navigate = useNavigate();
  const [vagas, setVagas] = useState([]);
  const [empresas, setEmpresas] = useState([]);

  const { user, isAuthenticated, isLoading } = useAuth();
  const { showNotification, NotificationComponent } = useNotification();

  const [interesses, setInteresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (isLoading) return; // ainda carregando estado de autenticação
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchInteresses();
  }, [isAuthenticated, isLoading]);

  const fetchInteresses = async () => {
    try {
      setLoading(true);

      // Pegar o token do localStorage (mesmo padrão que está funcionando)
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      if (!token) {
        console.error("Token não encontrado");
        showNotification({
          type: "error",
          title: "Erro de autenticação",
          message: "Por favor, faça login novamente",
          duration: 4000,
        });
        navigate("/");
        return;
      }

      const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

      // Buscar interesses
      const interessesResponse = await axios.get(
        `${API_URL}/api/interesses/meus-interesses`,
        {
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Interesses carregados:", interessesResponse.data);
      setInteresses(interessesResponse.data);

      // Buscar empresas para fazer o mapeamento correto
      try {
        const empresasResponse = await axios.get(`${API_URL}/api/companies`);
        console.log("✅ Empresas carregadas:", empresasResponse.data);
        setEmpresas(empresasResponse.data);
      } catch (empresasError) {
        console.error("Erro ao carregar empresas:", empresasError);
        // Continua mesmo se não conseguir carregar empresas
      }
    } catch (error) {
      console.error("Erro ao buscar interesses:", error);

      if (error.response?.status === 401) {
        showNotification({
          type: "error",
          title: "Sessão expirada",
          message: "Por favor, faça login novamente",
          duration: 4000,
        });
        navigate("/");
      } else {
        showNotification({
          type: "error",
          title: "Erro ao carregar",
          message: "Não foi possível carregar seus interesses",
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getEmpresaName = (companyId) => {
    const empresa = empresas.find((e) => e.id === companyId);
    return empresa?.name || "Empresa";
  };

  const handleRemoverInteresse = async (vagaId, vagaNome) => {
    if (removingId) return;

    setRemovingId(vagaId);

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (!token) {
      showNotification({
        type: "error",
        title: "Erro de autenticação",
        message: "Por favor, faça login novamente",
        duration: 4000,
      });
      return;
    }

    const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

    try {
      await axios.delete(`${API_URL}/api/interesses/vaga/${vagaId}`, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });

      // Remover da lista local
      setInteresses((prev) =>
        prev.filter((interesse) => {
          const vaga = interesse.job || interesse.vaga;
          return vaga?.id !== vagaId;
        })
      );

      showNotification({
        type: "success",
        title: "Interesse removido",
        message: `Vaga ${vagaNome} removida dos seus interesses`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao remover interesse:", error);
      showNotification({
        type: "error",
        title: "Erro ao remover",
        message: "Não foi possível remover o interesse",
        duration: 3000,
      });
    } finally {
      setRemovingId(null);
    }
  };

  // Filtrar interesses baseado na busca
  const interessesFiltrados = interesses.filter((interesse) => {
    const vaga = interesse.job || interesse.vaga;
    if (!vaga) return false;

    const titulo = (vaga.title || vaga.nome || vaga.titulo || "").toLowerCase();
    const empresaNome = getEmpresaName(vaga.company_id).toLowerCase();
    const cidade = (vaga.location || vaga.cidade || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      titulo.includes(search) ||
      empresaNome.includes(search) ||
      cidade.includes(search)
    );
  });

  const formatarData = (data) => {
    if (!data) return "";
    const date = new Date(data);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar
          currentView="interesses"
          onViewChange={(view) => console.log("View changed:", view)}
        />

        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="relative mx-auto mb-8 w-16 h-16">
                <div className="w-16 h-16 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-500 rounded-full animate-spin"
                  style={{ animationDirection: "reverse" }}
                ></div>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                Carregando seus interesses
              </h3>
              <p className="text-gray-600">
                Buscando as vagas que você salvou...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        currentView="interesses"
        onViewChange={(view) => console.log("View changed:", view)}
      />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-white relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-l from-green-500/5 to-green-400/5 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => navigate("/vagas")}
                  className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-black transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                      <Heart className="w-8 h-8 text-green-600 fill-green-600" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold text-black">
                        Minhas Vagas
                      </h1>
                      <p className="text-gray-600 mt-1">
                        Vagas externas que você demonstrou interesse
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contador de interesses */}
              <div className="bg-green-500/10 text-green-700 px-6 py-3 rounded-full border border-green-500/30 inline-flex items-center gap-2">
                <Heart className="w-5 h-5 fill-green-700" />
                <span className="font-semibold">
                  {interessesFiltrados.length} vaga
                  {interessesFiltrados.length !== 1 ? "s" : ""} salva
                  {interessesFiltrados.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Barra de busca */}
        {interesses.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Buscar nos seus interesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>
        )}

        {/* Lista de Interesses */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {interessesFiltrados.length > 0 ? (
            <div className="grid gap-6">
              {interessesFiltrados.map((interesse) => {
                const vaga = interesse.job || interesse.vaga;
                if (!vaga) return null;

                // Pegar o nome da vaga seguindo o padrão do VagasPage
                const nomeVaga = vaga.title || vaga.nome;
                const empresaNome = getEmpresaName(vaga.company_id);
                const localizacao =
                  vaga.location || `${vaga.cidade}, ${vaga.state}`;
                const modalidade = vaga.job_type || vaga.modalidade;
                const descricao = vaga.description || vaga.descricao;

                return (
                  <article
                    key={interesse.id}
                    className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 hover:bg-gray-50 transition-all duration-300 hover:border-gray-300"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <header className="mb-6">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <h3 className="text-xl sm:text-2xl font-bold text-black line-clamp-2 flex-1">
                              {nomeVaga}
                            </h3>
                            <button
                              onClick={() =>
                                navigate(`/empresa/${vaga.company_id}`)
                              }
                              className="bg-gradient-to-r from-green-500/10 to-green-400/10 text-green-700 px-3 py-1 rounded-full text-sm font-medium hover:from-green-500/20 hover:to-green-400/20 transition-all duration-200 border border-green-500/30 hover:border-green-500/40 flex-shrink-0"
                            >
                              {empresaNome}
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>{localizacao}</span>
                            </div>
                            {modalidade && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span>{modalidade}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-700">
                              <Building2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>
                                Salvo em {formatarData(interesse.dataInteresse)}
                              </span>
                            </div>
                          </div>
                        </header>

                        {/* Descrição resumida */}
                        {descricao && (
                          <p className="text-gray-700 leading-relaxed line-clamp-3 mb-4">
                            {descricao}
                          </p>
                        )}

                        {/* Tag de vaga externa */}
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-700 px-3 py-1 rounded-lg text-sm border border-blue-500/30">
                          <ExternalLink className="w-4 h-4" />
                          Vaga Externa
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="xl:w-50 flex-shrink-0 space-y-3">
                        <button
                          onClick={() => navigate(`/vagas/${vaga.id}`)}
                          className="w-full px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 hover:-translate-y-0.5"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Detalhes
                        </button>

                        <button
                          onClick={() =>
                            handleRemoverInteresse(vaga.id, nomeVaga)
                          }
                          disabled={removingId === vaga.id}
                          className="w-full px-4 py-3 bg-white rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-300 transition-all duration-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-5 h-5" />
                          {removingId === vaga.id ? "Removendo..." : "Remover"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">
                {searchTerm
                  ? "Nenhum interesse encontrado"
                  : "Você ainda não salvou nenhuma vaga"}
              </h3>
              <p className="text-gray-700 max-w-md mx-auto mb-8 px-4">
                {searchTerm
                  ? "Tente buscar por outros termos."
                  : "Explore as vagas externas disponíveis e salve as que mais te interessam clicando no coração."}
              </p>
              <button
                onClick={() => navigate("/vagas")}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium inline-flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Explorar Vagas
              </button>
            </div>
          )}
        </section>
      </main>

      {NotificationComponent}
    </div>
  );
};

export default MeusInteresses;
