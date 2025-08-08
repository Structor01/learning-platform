// src/components/ui/UserProfile.jsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "./Navbar";
import {
  User,
  Calendar,
  BookOpen,
  Award,
  Clock,
  Download,
  Edit,
  TrendingUp,
  Target,
  Star,
  Trophy,
  Zap,
  CheckCircle,
  Brain,
  Users,
  RefreshCw,
  AlertCircle,
  Linkedin,
  FileText,
  ExternalLink,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import testService from "../../services/testService";

const UserProfile = () => {
  const { user, updateUser, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [role, setRole] = useState("Executivo de Vendas");
  const [linkedin, setLinkedin] = useState("");
  const [curriculoUrl, setCurriculoUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);

  // Estados para dados do teste psicológico
  const [testResults, setTestResults] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [testError, setTestError] = useState(null);

  const userId = user?.id || user?.user_id;

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setRole(user.role || "Executivo de Vendas");
      setLinkedin(user.linkedin || "");
      setCurriculoUrl(user.curriculo_url || "");
    }
  }, [user]);

  // Carregar dados do teste psicológico
  useEffect(() => {
    const loadTestResults = async () => {
      if (!userId) return;

      try {
        setLoadingTest(true);
        setTestError(null);

        // Buscar teste psicológico completo do usuário
        const userTests = await testService.getUserPsychologicalTests(
          userId,
          "completed",
          1
        );

        if (userTests.tests && userTests.tests.length > 0) {
          const completedTest = userTests.tests[0];

          // Obter relatório detalhado
          const report = await testService.getPsychologicalTestReport(
            completedTest.id
          );

          setTestResults({
            test: completedTest,
            scores: {
              disc: completedTest.disc_scores,
              bigFive: completedTest.big_five_scores,
              leadership: completedTest.leadership_scores,
            },
            analysis: {
              overall: completedTest.overall_analysis,
              recommendations: completedTest.recommendations,
            },
            report: report,
            completedAt: completedTest.completed_at,
          });
        }

        setLoadingTest(false);
      } catch (error) {
        console.error("Erro ao carregar dados do teste:", error);
        setTestError("Erro ao carregar dados do teste");
        setLoadingTest(false);
      }
    };

    loadTestResults();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    await updateUser({ name, role });
    setIsEditing(false);
  };

  const handleSaveLinks = async () => {
    try {
      setIsSavingLinks(true);

      // Validar URLs se fornecidas
      if (linkedin && !isValidUrl(linkedin)) {
        alert("Por favor, insira uma URL válida para o LinkedIn");
        return;
      }

      if (curriculoUrl && !isValidUrl(curriculoUrl)) {
        alert("Por favor, insira uma URL válida para o currículo");
        return;
      }

      await updateUser({
        linkedin:  linkedin?.trim() || undefined,
        curriculoUrl: curriculoUrl?.trim() || undefined, // <-- Corrigido aqui
      });

      setIsEditingLinks(false);
    } catch (error) {
      console.error("Erro ao salvar links:", error);
      alert("Erro ao salvar os links. Tente novamente.");
    } finally {
      setIsSavingLinks(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const cancelEditLinks = () => {
    setLinkedin(user?.linkedin || "");
    setCurriculoUrl(user?.curriculo_url || "");
    setIsEditingLinks(false);
  };

  // Usar dados reais do teste ou dados mockados como fallback
  const getDiscProfile = () => {
    if (testResults?.scores?.disc) {
      const discScores = testResults.scores.disc;

      // Encontrar o perfil predominante
      const maxScore = Math.max(...Object.values(discScores));
      const predominantKey = Object.keys(discScores).find(
        (key) => discScores[key] === maxScore
      );

      const profileNames = {
        D: "Dominante",
        I: "Influente",
        S: "Estável",
        C: "Conforme",
      };

      return {
        dominante: Math.round(discScores.D || 0),
        influente: Math.round(discScores.I || 0),
        estavel: Math.round(discScores.S || 0),
        conforme: Math.round(discScores.C || 0),
        predominant: profileNames[predominantKey] || "Conforme",
      };
    }

    // Fallback para dados mockados
    return (
      user?.discProfile || {
        dominante: 23,
        influente: 13,
        estavel: 27,
        conforme: 38,
        predominant: "Conforme",
      }
    );
  };

  const discProfile = getDiscProfile();

  const progress = user?.progress || {
    coursesCompleted: 3,
    certifications: 2,
    totalHours: 24,
  };

  const learningTracks = [
    {
      name: "Gestão de Carreira",
      progress: 85,
      color: "bg-orange-500",
      status: "Em andamento",
    },
    {
      name: "Autoconhecimento para Carreiras",
      progress: 0,
      color: "bg-purple-500",
      status: "Bloqueado",
    },
    {
      name: "Finanças Pessoais",
      progress: 0,
      color: "bg-green-500",
      status: "Bloqueado",
    },
    {
      name: "Auto análise e Foco em metas",
      progress: 0,
      color: "bg-blue-500",
      status: "Bloqueado",
    },
  ];

  const achievements = [
    { name: "Primeiro Login", icon: "🎯", date: "Hoje", color: "bg-green-500" },
    {
      name: "Perfil DISC Completo",
      icon: "📊",
      date: "Hoje",
      color: "bg-blue-500",
    },
    {
      name: "Trilha Iniciada",
      icon: "🚀",
      date: "Hoje",
      color: "bg-orange-500",
    },
    {
      name: "Bem-vindo AgroSkills",
      icon: "🌱",
      date: "Hoje",
      color: "bg-green-600",
    },
  ];

  const discProfiles = [
    {
      name: "Dominante",
      value: discProfile.dominante,
      color: "bg-red-500",
      letter: "D",
      description: "Direto e decidido",
    },
    {
      name: "Influente",
      value: discProfile.influente,
      color: "bg-green-500",
      letter: "I",
      description: "Comunicativo e otimista",
    },
    {
      name: "Estável",
      value: discProfile.estavel,
      color: "bg-blue-500",
      letter: "S",
      description: "Paciente e leal",
    },
    {
      name: "Conforme",
      value: discProfile.conforme,
      color: "bg-orange-500",
      letter: "C",
      description: "Preciso e sistemático",
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
              <p className="text-gray-400">
                Acompanhe seu progresso na AgroSkills
              </p>
            </div>
            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Salvar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Edit className="w-4 h-4 mr-2" /> Editar Perfil
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:!grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24 mx-auto border-4 border-green-500">
                    <AvatarImage src="/placeholder-avatar.jpg" alt={name} />
                    <AvatarFallback className="bg-green-600 text-white text-2xl">
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>

                {isEditing ? (
                  <input
                    className="text-xl font-bold text-center text-white mb-1 w-full bg-gray-800 border border-gray-600 rounded px-2 py-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white mb-1">{name}</h2>
                )}

                {isEditing ? (
                  <input
                    className="text-gray-300 mb-4 text-center w-full bg-gray-800 border border-gray-600 rounded px-2 py-1"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                ) : (
                  <p className="text-gray-300 mb-4">{role}</p>
                )}

                <div className="flex items-center justify-center text-sm text-gray-400 mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  Membro desde Janeiro 2024
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-600/20 border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-green-400 text-sm font-medium">
                    Ativo
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* DISC Profile Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span>Seu Perfil DISC</span>
                  </div>
                  {loadingTest && (
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {testError && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <p className="text-red-300 text-sm">{testError}</p>
                    </div>
                  </div>
                )}

                {testResults && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <p className="text-blue-300 text-sm">
                        Dados do teste psicológico realizado em{" "}
                        {new Date(testResults.completedAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {discProfiles.map((profile) => (
                    <div key={profile.name} className="text-center">
                      <div
                        className={`w-16 h-16 ${profile.color} rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg`}
                      >
                        <span className="text-white text-xl font-bold">
                          {profile.letter}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white mb-1">
                        {profile.name}
                      </p>
                      <p className="text-lg font-bold text-green-400">
                        {profile.value}%
                      </p>
                      <p className="text-xs text-gray-400">
                        {profile.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-center p-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-lg mb-4">
                  <p className="text-sm text-gray-300 mb-1">
                    Perfil predominante
                  </p>
                  <p className="text-lg font-bold text-orange-400">
                    {discProfile.predominant}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  disabled={!testResults}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {testResults
                    ? "Baixar Certificado DISC"
                    : "Realize o teste para baixar certificado"}
                </Button>
              </CardContent>
            </Card>

            {/* LinkedIn e Currículo Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-green-500" />
                    <span>LinkedIn e Currículo</span>
                  </div>
                  {!isEditingLinks && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingLinks(true)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isEditingLinks ? (
                  <div className="space-y-4">
                    {/* LinkedIn Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        LinkedIn
                      </label>
                      <div className="relative">
                        <Linkedin className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/seu-perfil"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Currículo URL Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Link do Currículo
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-green-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="url"
                          placeholder="https://drive.google.com/file/d/..."
                          value={curriculoUrl}
                          onChange={(e) => setCurriculoUrl(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={handleSaveLinks}
                        disabled={isSavingLinks}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        {isSavingLinks ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Salvar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelEditLinks}
                        disabled={isSavingLinks}
                        className="border-gray-600 text-black hover:bg-gray-800"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* LinkedIn Display */}
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-3">
                        <Linkedin className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-300 font-medium">
                            LinkedIn
                          </p>
                          {linkedin ? (
                            <a
                              href={linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                            >
                              <span>Ver perfil</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <p className="text-gray-500 text-sm">
                              Não adicionado
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Currículo Display */}
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-300 font-medium">
                            Currículo
                          </p>
                          {curriculoUrl ? (
                            <a
                              href={curriculoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 text-sm flex items-center space-x-1"
                            >
                              <span>Ver currículo</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <p className="text-gray-500 text-sm">
                              Não adicionado
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info Text */}
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mt-4">
                      <p className="text-blue-300 text-xs">
                        💡 Dica: Mantenha seus links atualizados para uma melhor
                        apresentação profissional
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:!grid-cols-3 gap-6">
              <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {progress.coursesCompleted}
                  </p>
                  <p className="text-sm text-gray-400">Cursos Concluídos</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {progress.certifications}
                  </p>
                  <p className="text-sm text-gray-400">Certificações</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {progress.totalHours}h
                  </p>
                  <p className="text-sm text-gray-400">Horas de Estudo</p>
                </CardContent>
              </Card>
            </div>

            {/* Big Five e Liderança Cards */}
            {testResults && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Big Five Card */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <span>Big Five</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {testResults.scores.bigFive &&
                        Object.entries(testResults.scores.bigFive).map(
                          ([trait, score]) => (
                            <div
                              key={trait}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-300 capitalize text-sm">
                                {trait === "openness"
                                  ? "Abertura"
                                  : trait === "conscientiousness"
                                  ? "Conscienciosidade"
                                  : trait === "extraversion"
                                  ? "Extroversão"
                                  : trait === "agreeableness"
                                  ? "Amabilidade"
                                  : trait === "neuroticism"
                                  ? "Neuroticismo"
                                  : trait}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-purple-500 h-2 rounded-full"
                                    style={{ width: `${(score / 5) * 100}%` }}
                                  />
                                </div>
                                <span className="text-white font-medium w-8 text-sm">
                                  {score.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </CardContent>
                </Card>

                {/* Liderança Card */}
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Users className="w-5 h-5 text-yellow-500" />
                      <span>Estilo de Liderança</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {testResults.scores.leadership &&
                        Object.entries(testResults.scores.leadership).map(
                          ([style, score]) => (
                            <div
                              key={style}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-300 capitalize text-sm">
                                {style === "autocratic"
                                  ? "Autocrático"
                                  : style === "democratic"
                                  ? "Democrático"
                                  : style === "transformational"
                                  ? "Transformacional"
                                  : style === "transactional"
                                  ? "Transacional"
                                  : style === "servant"
                                  ? "Servidor"
                                  : style}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{ width: `${(score / 10) * 100}%` }}
                                  />
                                </div>
                                <span className="text-white font-medium w-8 text-sm">
                                  {score.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Learning Tracks Progress */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Target className="w-5 h-5 text-green-500" />
                    <span>Progresso nas Trilhas</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:text-green-300"
                  >
                    Ver todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {learningTracks.map((track, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 ${track.color} rounded-full`}
                          ></div>
                          <span className="font-medium text-white">
                            {track.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              track.status === "Em andamento"
                                ? "bg-green-600/20 text-green-400 border border-green-500/30"
                                : "bg-gray-600/20 text-gray-400 border border-gray-500/30"
                            }`}
                          >
                            {track.status}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-300">
                          {track.progress}%
                        </span>
                      </div>
                      <Progress
                        value={track.progress}
                        className="h-2 bg-gray-800"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span>Conquistas Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-all duration-300"
                    >
                      <div
                        className={`w-10 h-10 ${achievement.color} rounded-full flex items-center justify-center`}
                      >
                        <span className="text-lg">{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {achievement.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {achievement.date}
                        </p>
                      </div>
                      <Star className="w-4 h-4 text-yellow-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
