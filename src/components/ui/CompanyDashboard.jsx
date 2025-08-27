import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  FileText,
  Plus,
  TrendingUp,
  Eye,
  MessageSquare,
  Calendar,
  MoreVertical,
  ExternalLink,
  User
} from "lucide-react";
import CompanyNavbar from "./CompanyNavbar";

const CompanyDashboard = () => {
  const { user, accessToken } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    vagas: [],
    candidaturas: [],
    stats: {
      vagasAtivas: 0,
      candidaturasRecebidas: 0,
      entrevistasAgendadas: 0,
      contratacoesMes: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [accessToken]);

  const loadDashboardData = async () => {
    if (!accessToken) return;

    try {
      setIsLoading(true);
      // Aqui você faria as chamadas para a API
      // Por enquanto, dados simulados
      setTimeout(() => {
        setDashboardData({
          vagas: [
            { id: 1, titulo: "Desenvolvedor Frontend", candidatos: 12, status: "ativa" },
            { id: 2, titulo: "Designer UX/UI", candidatos: 8, status: "ativa" },
            { id: 3, titulo: "Analista de Marketing", candidatos: 15, status: "pausada" }
          ],
          candidaturas: [
            { id: 1, candidato: "João Silva", vaga: "Desenvolvedor Frontend", status: "pendente" },
            { id: 2, candidato: "Maria Santos", vaga: "Designer UX/UI", status: "aprovado" },
            { id: 3, candidato: "Pedro Costa", vaga: "Analista de Marketing", status: "entrevista" }
          ],
          stats: {
            vagasAtivas: 5,
            candidaturasRecebidas: 28,
            entrevistasAgendadas: 7,
            contratacoesMes: 3
          }
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "ativa": return "default";
      case "pausada": return "secondary";
      case "pendente": return "outline";
      case "aprovado": return "default";
      case "entrevista": return "secondary";
      default: return "outline";
    }
  };

  const getBadgeStyles = (status) => {
    switch (status) {
      case "ativa":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pausada":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "pendente":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "aprovado":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "entrevista":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
        <CompanyNavbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
      <CompanyNavbar />

      <div className="pt-20 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Dashboard Empresa
              </h1>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Vaga
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {/* Dashboard Cards */}
          <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{dashboardData.stats.vagasAtivas}</div>
                    <div className="flex items-center text-green-400 text-sm font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +2 esta semana
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Vagas Ativas</h3>
                  <p className="text-sm text-gray-300">Total de oportunidades abertas</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{dashboardData.stats.candidaturasRecebidas}</div>
                    <div className="flex items-center text-green-400 text-sm font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12 hoje
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Candidaturas</h3>
                  <p className="text-sm text-gray-300">Aplicações recebidas</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{dashboardData.stats.entrevistasAgendadas}</div>
                    <div className="text-sm text-gray-300 font-medium">
                      Esta semana
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Entrevistas</h3>
                  <p className="text-sm text-gray-300">Agendamentos confirmados</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{dashboardData.stats.contratacoesMes}</div>
                    <div className="flex items-center text-green-400 text-sm font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +1 esta semana
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Contratações</h3>
                  <p className="text-sm text-gray-300">Realizações este mês</p>
                </div>
              </CardContent>
            </Card>
          </div>





          {/* Vagas Recentes */}
          <section className="mb-12">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2">

              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">Vagas Recentes</CardTitle>
                    <p className="text-gray-300 mt-1">Suas oportunidades publicadas</p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Vaga
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-white">Vaga</TableHead>
                        <TableHead className="text-white">Status</TableHead>
                        <TableHead className="text-white">Candidatos</TableHead>
                        <TableHead className="text-white">Publicada</TableHead>
                        <TableHead className="text-white text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.vagas.map((vaga) => (
                        <TableRow key={vaga.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className=" text-white font-extrabold">{vaga.titulo}</div>
                                <div className="text-sm text-gray-400">Tempo integral</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getBadgeStyles(vaga.status)} border-0`}>
                              {vaga.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-gray-600">
                              <Users className="h-4 w-4 mr-1" />
                              <span className="font-medium">{vaga.candidatos}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600">Há 2 dias</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="outline" className="h-8">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              <Button size="sm" variant="outline" className="h-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Candidaturas Recentes */}
          <section className="mb-12">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">Candidaturas Recentes</CardTitle>
                    <p className="text-gray-300 mt-1">Aplicações mais recentes</p>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
                    Ver todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-white font-extrabold">Candidato</TableHead>
                        <TableHead className="text-white font-extrabold">Vaga</TableHead>
                        <TableHead className="text-white font-extrabold">Status</TableHead>
                        <TableHead className="text-white font-extrabold">Aplicou em</TableHead>
                        <TableHead className="text-white text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.candidaturas.map((candidatura, index) => (
                        <TableRow key={candidatura.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-white">{candidatura.candidato}</div>
                                <div className="text-sm text-gray-400">Candidato</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-white">{candidatura.vaga}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getBadgeStyles(candidatura.status)} border-0`}>
                              {candidatura.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">Há {index + 1} horas</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button size="sm" variant="outline" className="h-8">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Contatar
                              </Button>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Ver Perfil
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;