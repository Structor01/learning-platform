// src/components/ui/MinhasCandidaturasPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Clock,
  Building2,
  Calendar,
  Eye,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Hourglass,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "../utils/api";
import Navbar from "./Navbar";

const MinhasCandidaturasPage = () => {
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, accessToken, isAuthenticated, isLoading } = useAuth();

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Buscar candidaturas quando usuário carregado
  useEffect(() => {
    if (isAuthenticated && user?.id && !isLoading) {
      fetchCandidaturas();
    }
  }, [isAuthenticated, user, isLoading]);

  // ✅ FUNÇÃO ASYNC CORRIGIDA
  const fetchCandidaturas = async () => {
    if (!user?.id) {
      setError("Usuário não encontrado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 Buscando candidaturas para usuário ID:", user.id);

      const response = await axios.get(
        `${API_URL}/api/candidaturas/usuario/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("📋 Candidaturas recebidas:", response.data);
      console.log("📊 Primeira candidatura (exemplo):", response.data[0]);

      setCandidaturas(response.data);
    } catch (err) {
      console.error("Erro ao buscar candidaturas:", err);
      console.error(
        "URL tentada:",
        `${API_URL}/api/candidaturas/usuario/${user.id}`
      );
      setError("Erro ao carregar suas candidaturas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO ASYNC PARA BUSCAR EMPRESA
  const buscarEmpresa = async (candidatura) => {
    try {
      console.log(
        "🔍 Iniciando busca da empresa para candidatura:",
        candidatura
      );

      // Primeira tentativa: buscar dados completos da vaga
      try {
        console.log("📄 Buscando dados da vaga ID:", candidatura.vaga_id);
        const vagaResponse = await axios.get(
          `${API_URL}/api/vagas/${candidatura.vaga_id}`
        );
        console.log("✅ Dados da vaga:", vagaResponse.data);

        const empresaId = vagaResponse.data.company_id;
        if (empresaId) {
          console.log("🏢 Empresa ID encontrado na vaga:", empresaId);
          navigate(`/empresa/${empresaId}`);
          return;
        }
      } catch (vagaError) {
        console.log(
          "⚠️ Não foi possível buscar vaga, tentando por nome da empresa..."
        );
      }

      // Segunda tentativa: buscar empresa por nome
      const nomeEmpresa = candidatura.vaga?.empresa;
      if (nomeEmpresa) {
        console.log("🔎 Buscando empresa por nome:", nomeEmpresa);

        const empresasResponse = await axios.get(`${API_URL}/api/companies`);
        console.log("📋 Empresas disponíveis:", empresasResponse.data);

        // Buscar empresa com nome exato ou similar
        const empresa = empresasResponse.data.find((emp) => {
          const nomeEmpresaLower = nomeEmpresa.toLowerCase().trim();
          const nomeEmpBusca = emp.name?.toLowerCase().trim();

          // Busca exata
          if (nomeEmpBusca === nomeEmpresaLower) return true;

          // Busca parcial (contém)
          if (
            nomeEmpBusca?.includes(nomeEmpresaLower) ||
            nomeEmpresaLower.includes(nomeEmpBusca)
          )
            return true;

          return false;
        });

        if (empresa) {
          console.log("✅ Empresa encontrada por nome:", empresa);
          navigate(`/empresa/${empresa.id}`);
        } else {
          console.log("❌ Empresa não encontrada na lista");
          alert(`❌ Empresa "${nomeEmpresa}" não encontrada na base de dados.`);
        }
      } else {
        alert("❌ Nome da empresa não disponível nos dados da candidatura.");
      }
    } catch (error) {
      console.error("❌ Erro geral ao buscar empresa:", error);
      alert("❌ Erro ao buscar dados da empresa. Tente novamente.");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "aprovado":
      case "aprovada":
        return "bg-green-100 text-green-800 border-green-200";
      case "reprovado":
      case "reprovada":
        return "bg-red-100 text-red-800 border-red-200";
      case "em_analise":
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "aprovado":
      case "aprovada":
        return <CheckCircle className="w-4 h-4" />;
      case "reprovado":
      case "reprovada":
        return <XCircle className="w-4 h-4" />;
      case "em_analise":
      case "pendente":
        return <Hourglass className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Data não disponível";

    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Data inválida";
    }
  };

  // Mostrar loading durante verificação de autenticação
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar
          currentView="candidaturas"
          onViewChange={(view) => console.log("View changed:", view)}
          onAddTrilha={() => console.log("Add trilha")}
        />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto mb-8 w-16 h-16">
              <div className="w-16 h-16 border-4 border-gray-700 border-t-orange-600 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-red-500 rounded-full animate-spin"
                style={{ animationDirection: "reverse" }}
              ></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Carregando candidaturas
            </h3>
            <p className="text-gray-400">Buscando suas candidaturas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <Navbar
        currentView="candidaturas"
        onViewChange={(view) => console.log("View changed:", view)}
        onAddTrilha={() => console.log("Add trilha")}
      />

      {/* Content */}
      <div className="pt-16">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur border-gray-800 shadow-lg border-b sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/vagas")}
                  className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">
                      Minhas Candidaturas
                    </h1>
                    <p className="text-gray-400 text-sm lg:text-base">
                      Acompanhe o status das suas candidaturas
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-white font-medium">
                  {user?.name || "Usuário"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {candidaturas.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Nenhuma candidatura encontrada
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                Você ainda não se candidatou a nenhuma vaga. Explore as
                oportunidades disponíveis e encontre a vaga ideal para você!
              </p>
              <button
                onClick={() => navigate("/vagas")}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                Ver Vagas Disponíveis
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {candidaturas.length} candidatura
                  {candidaturas.length !== 1 ? "s" : ""} encontrada
                  {candidaturas.length !== 1 ? "s" : ""}
                </h2>
              </div>

              <div className="grid gap-6">
                {candidaturas.map((candidatura) => (
                  <div
                    key={candidatura.id}
                    className="bg-gray-900/80 backdrop-blur border-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border hover:border-gray-700 overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header da candidatura */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex-shrink-0">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-1">
                                {candidatura.vaga?.nome ||
                                  candidatura.jobTitle ||
                                  "Vaga não especificada"}
                              </h3>
                              <p className="text-lg text-orange-400 font-semibold mb-2">
                                {candidatura.vaga?.empresa ||
                                  candidatura.empresa?.name ||
                                  candidatura.companyName ||
                                  "Empresa não especificada"}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-orange-500" />
                                  <span>
                                    {candidatura.vaga?.cidade || "São Paulo"},{" "}
                                    {candidatura.vaga?.uf || "SP"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-blue-500" />
                                  <span>
                                    {candidatura.vaga?.modalidade || "CLT"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <div
                            className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium ${getStatusColor(
                              candidatura.status
                            )}`}
                          >
                            {getStatusIcon(candidatura.status)}
                            <span className="capitalize">
                              {candidatura.status?.replace("_", " ") ||
                                "Em análise"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Candidatura em{" "}
                              {formatDate(
                                candidatura.created_at ||
                                candidatura.createdAt ||
                                candidatura.data_candidatura
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Descrição da vaga */}
                      {candidatura.vaga?.descricao && (
                        <div className="mb-4">
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {candidatura.vaga.descricao.length > 200
                              ? `${candidatura.vaga.descricao.substring(
                                0,
                                200
                              )}...`
                              : candidatura.vaga.descricao}
                          </p>
                        </div>
                      )}

                      {/* Remuneração */}
                      {candidatura.vaga?.remuneracao && (
                        <div className="mb-4">
                          <div className="inline-block bg-green-900/30 border border-green-700/50 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                            💰 {candidatura.vaga.remuneracao}
                          </div>
                        </div>
                      )}

                      {/* Footer com ações */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        <div className="text-sm text-gray-500">
                          ID da candidatura: #{candidatura.id}
                        </div>

                        <button
                          onClick={() => buscarEmpresa(candidatura)}
                          className="flex items-center gap-2 px-4 py-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          Ver empresa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MinhasCandidaturasPage;
