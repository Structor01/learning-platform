// src/components/ui/UserProfile.jsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "../components/ui/Navbar";
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
  Camera,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import testService from "../services/testDiscService/testService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const UserProfile = () => {
  const { user, updateUser, isLoading, accessToken } = useAuth();

  const [name, setName] = useState("");
  const [role, setRole] = useState("Executivo de Vendas");
  const [linkedin, setLinkedin] = useState("");
  const [curriculoUrl, setCurriculoUrl] = useState("");
  const [curriculoFile, setCurriculoFile] = useState(null); // Estado para o arquivo
  const [profileImage, setProfileImage] = useState(""); // Estado para imagem de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Estados para dados do teste psicológico
  const [testResults, setTestResults] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [testError, setTestError] = useState(null);

  const userId = user?.id || user?.user_id;

  useEffect(() => {
    if (user) {
      console.log("Dados do usuário no contexto:", user);
      setName(user.name || "");
      setRole(user.role || "Executivo de Vendas");
      setLinkedin(user.linkedin || "");
      setCurriculoUrl(user.curriculo_url || "");
      setProfileImage(user.profile_image || user.userLegacy?.image || "");
    }
  }, [user]);

  useEffect(() => {
    const verifyFiles = async () => {
      const curriculoExists = await checkCurriculoExists();
      if (curriculoExists && !curriculoUrl) {
        setCurriculoUrl("exists"); // Marcador para indicar que existe
      }
    };

    if (userId) {
      verifyFiles();
    }
  }, [userId, curriculoUrl]);

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

  //useEffect para recarregar dados do usuário após salvar
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;

      try {
        const token = accessToken || sessionStorage.getItem("accessToken");
        if (!token) return;

        // Buscar dados atualizados do usuário
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("Dados do usuário carregados:", userData);

          // Atualizar os estados locais com os dados do servidor
          setName(userData.name || "");
          setRole(userData.role || "Executivo de Vendas");
          setLinkedin(userData.linkedin || "");
          // curriculoUrl pode ser Buffer, mantemos como está para verificações
          setCurriculoUrl(userData.curriculo_url || "");

          // Preparar dados sanitizados para o contexto (só campos necessários)
          const cleanedData = {
            name: userData.name,
            role: userData.role,
            linkedin: userData.linkedin,
            // curriculoUrl é um Buffer no backend, não enviamos para o contexto
            // O contexto não precisa dos dados do arquivo, apenas saber se existe
          };

          // Atualizar o contexto com dados limpos
          await updateUser(cleanedData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    };

    // 5. Use esta função para verificar se o currículo existe

    // Carregar dados quando o componente monta e quando o userId muda
    loadUserData();
  }, [userId]); // Dependência no userId

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    await updateUser({ name, role });
    setIsEditing(false);
  };

  // Função para converter imagem para base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Função para upload da imagem de perfil
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Formato de arquivo não suportado. Use JPEG, PNG ou GIF.');
      return;
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Arquivo muito grande. O tamanho máximo é 5MB.');
      return;
    }

    try {
      setIsUploadingImage(true);

      // Converter para base64
      const base64Image = await convertToBase64(file);
      
      // Salvar no backend
      const token = accessToken || sessionStorage.getItem("accessToken");
      if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/profile-image`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile_image: base64Image
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Atualizar estado local
      setProfileImage(base64Image);
      
      // Atualizar contexto do usuário
      await updateUser({ profile_image: base64Image });
      
      alert("Foto de perfil atualizada com sucesso!");
      
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      alert("Erro ao atualizar foto de perfil. Tente novamente.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleViewCurriculo = async () => {
    try {
      const token = accessToken || sessionStorage.getItem("accessToken");
      if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        return;
      }

      // Use a URL correta com /api e método GET
      const response = await fetch(`${API_BASE_URL}/api/users/curriculo`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          alert("Currículo não encontrado.");
          return;
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      // Obter o blob do arquivo
      const blob = await response.blob();

      // Criar URL temporária para o blob
      const url = window.URL.createObjectURL(blob);

      // Abrir em nova aba para visualizar (se for PDF) ou baixar
      window.open(url, "_blank");

      // Limpar a URL após um tempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("Erro ao visualizar currículo:", error);
      alert("Erro ao carregar currículo. Tente novamente.");
    }
  };

  // 2. Adicione uma função alternativa para forçar download
  const handleDownloadCurriculo = async () => {
    try {
      const token = accessToken || sessionStorage.getItem("accessToken");
      if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/curriculo`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          alert("Currículo não encontrado.");
          return;
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Criar elemento de download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `curriculo_${user?.name || "usuario"}.pdf`;

      document.body.appendChild(a);
      a.click();

      // Limpar
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar currículo:", error);
      alert("Erro ao baixar currículo. Tente novamente.");
    }
  };

  // Substitua a função handleSaveLinks no seu UserProfile.jsx

  const handleSaveLinks = async () => {
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("URL completa:", `${API_BASE_URL}/api/users/curriculo`);

    const tokenFromSession = sessionStorage.getItem("accessToken");
    console.log("Token do sessionStorage:", tokenFromSession?.substring(0, 20));
    console.log("Token do contexto:", accessToken?.substring(0, 20));
    console.log("Tokens são iguais?", tokenFromSession === accessToken);

    try {
      setIsSavingLinks(true);

      const token = accessToken || sessionStorage.getItem("accessToken");
      console.log("sessionStorage:", Object.keys(sessionStorage));
      console.log("localStorage:", Object.keys(localStorage));

      if (!token) {
        console.error("Token não encontrado no sessionStorage");
        alert("Sessão expirada. Faça login novamente.");
        return;
      }

      console.log("Token encontrado:", token ? "✓" : "✗");
      console.log("Token completo:", token);
      console.log("Primeiros caracteres do token:", token?.substring(0, 20));
      console.log("Tamanho do token:", token?.length);

      // Se há um arquivo para upload
      if (curriculoFile) {
        const formData = new FormData();
        formData.append("file", curriculoFile);

        console.log("Enviando FormData:", {
          arquivo: curriculoFile.name,
        });

        const response = await fetch(`${API_BASE_URL}/api/users/curriculo`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        console.log("Resposta status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Erro na resposta:", errorText);
          throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        console.log("Dados da resposta:", responseData);
      }

      // Sempre atualizar LinkedIn (seja com arquivo ou não)  
      let updateData = {};
      
      if (linkedin && linkedin.trim()) {
        console.log("LinkedIn será atualizado:", linkedin);
        updateData.linkedin = linkedin.trim();
      }

      // Se tiver dados para atualizar, faça uma única chamada
      if (Object.keys(updateData).length > 0) {
        console.log("Atualizando dados do usuário:", updateData);
        await updateUser(updateData);
      }

      setIsEditingLinks(false);
      setCurriculoFile(null);
      alert("Links salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar links:", error);

      if (error.message.includes("401")) {
        alert("Sessão expirada. Faça login novamente.");
      } else if (error.message.includes("413")) {
        alert("Arquivo muito grande. Tente um arquivo menor.");
      } else if (error.message.includes("415")) {
        alert("Formato de arquivo não suportado.");
      } else {
        alert(`Erro ao salvar os links: ${error.message}`);
      }
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

  // 4. Adicione uma função para verificar se há currículo
  const checkCurriculoExists = async () => {
    try {
      const token = accessToken || sessionStorage.getItem("accessToken");
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/api/users/curriculo`, {
        method: "HEAD", // Apenas verificar se existe
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Erro ao verificar currículo:", error);
      return false;
    }
  };

  // curriculoUrl é um Buffer no backend, então verificamos se existe (objeto ou string)
  const hasCurriculo = Boolean(
    user?.curriculo_url || 
    curriculoUrl || 
    curriculoUrl === "exists" ||
    (typeof curriculoUrl === 'object' && curriculoUrl !== null)
  );

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
      color: "bg-blue-600",
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
      color: "bg-amber-500",
      status: "Bloqueado",
    },
    {
      name: "Auto análise e Foco em metas",
      progress: 0,
      color: "bg-pink-600",
      status: "Bloqueado",
    },
  ];

  const achievements = [
    { name: "Primeiro Login", icon: "🎯", date: "Hoje", color: "bg-blue-500" },
    {
      name: "Perfil DISC Completo",
      icon: "📊",
      date: "Hoje",
      color: "bg-purple-500",
    },
    {
      name: "Trilha Iniciada",
      icon: "🚀",
      date: "Hoje",
      color: "bg-amber-500",
    },
    {
      name: "Bem-vindo AgroSkills",
      icon: "🌱",
      date: "Hoje",
      color: "bg-pink-500",
    },
  ];

  const discProfiles = [
    {
      name: "Dominante",
      value: discProfile.dominante,
      color: "bg-green-700",
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
      color: "bg-green-600",
      letter: "S",
      description: "Paciente e leal",
    },
    {
      name: "Conforme",
      value: discProfile.conforme,
      color: "bg-green-400",
      letter: "C",
      description: "Preciso e sistemático",
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Meu Perfil</h1>
              <p className="text-gray-600">
                Acompanhe seu progresso na AgroSkills
              </p>
            </div>
            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-gray-300 text-black hover:bg-gray-100"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Salvar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-gray-300 text-black hover:bg-gray-100"
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
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 mx-auto border-4 border-green-500">
                      <AvatarImage 
                        src={profileImage || user?.userLegacy?.image || "/placeholder-avatar.jpg"} 
                        alt={name} 
                      />
                      <AvatarFallback className="bg-green-600 text-white text-2xl">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Botão de upload de imagem */}
                    <div className="">
                      <label
                        htmlFor="profile-image-upload"
                        className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                        title="Alterar foto de perfil"
                      >
                        {isUploadingImage ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 text-white" />
                        )}
                      </label>
                      <input
                        id="profile-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>

                {isEditing ? (
                  <input
                    className="text-xl font-bold text-center text-black mb-1 w-full bg-gray-100 border border-gray-300 rounded px-2 py-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-black mb-1">{name}</h2>
                )}

                {isEditing ? (
                  <input
                    className="text-gray-700 mb-4 text-center w-full bg-gray-100 border border-gray-300 rounded px-2 py-1"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                ) : (
                  <p className="text-gray-700 mb-4">{role}</p>
                )}

                <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  Membro desde Janeiro 2024
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 border border-green-300">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                  <span className="text-green-700 text-sm font-medium">
                    Ativo
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* DISC Profile Card */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-black">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Seu Perfil DISC</span>
                  </div>
                  {loadingTest && (
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {testError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-red-700 text-sm">{testError}</p>
                    </div>
                  </div>
                )}

                {testResults && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-green-700 text-sm">
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
                      <p className="text-sm font-medium text-black mb-1">
                        {profile.name}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {profile.value}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {profile.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-center p-4 bg-gradient-to-r from-green-100 to-green-50 border border-green-300 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 mb-1">
                    Perfil predominante
                  </p>
                  <p className="text-lg font-bold text-green-700">
                    {discProfile.predominant}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-black hover:bg-gray-100"
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
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-black">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-green-600" />
                    <span>LinkedIn e Currículo</span>
                  </div>
                  {!isEditingLinks && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingLinks(true)}
                      className="text-gray-600 hover:text-black p-1"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn
                      </label>
                      <div className="relative">
                        <Linkedin className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/seu-perfil"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded text-black placeholder-gray-500 focus:border-green-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Currículo Upload Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currículo (PDF)
                      </label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-green-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setCurriculoFile(e.target.files[0])}
                          className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded text-black focus:border-green-600 focus:outline-none"
                        />
                      </div>
                      {curriculoFile && (
                        <p className="text-sm text-green-600 mt-1">
                          Arquivo selecionado: {curriculoFile.name}
                        </p>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={handleSaveLinks}
                        disabled={isSavingLinks}
                        className="bg-green-600 hover:bg-green-700 text-white flex-1"
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
                        className="border-gray-300 text-black hover:bg-gray-100"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* LinkedIn Display */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-300">
                      <div className="flex items-center space-x-3">
                        <Linkedin className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-700 font-medium">
                            LinkedIn
                          </p>
                          {linkedin ? (
                            <a
                              href={linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
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
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-300">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-700 font-medium">
                            Currículo
                          </p>
                          {hasCurriculo ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={handleViewCurriculo}
                                className="text-green-600 hover:text-green-700 text-sm flex items-center space-x-1 cursor-pointer"
                              >
                                <span>Ver currículo</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                              <span className="text-gray-500">•</span>
                              <button
                                onClick={handleDownloadCurriculo}
                                className="text-green-600 hover:text-green-700 text-sm flex items-center space-x-1 cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                <span>Baixar</span>
                              </button>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">
                              Não adicionado
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Info Text */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                      <p className="text-green-700 text-xs">
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
              <Card className="bg-white border-gray-200 hover:border-gray-300 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-black mb-1">
                    {progress.coursesCompleted}
                  </p>
                  <p className="text-sm text-gray-600">Cursos Concluídos</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 hover:border-gray-300 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-black mb-1">
                    {progress.certifications}
                  </p>
                  <p className="text-sm text-gray-600">Certificações</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 hover:border-gray-300 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-black mb-1">
                    {progress.totalHours}h
                  </p>
                  <p className="text-sm text-gray-600">Horas de Estudo</p>
                </CardContent>
              </Card>
            </div>

            {/* Big Five e Liderança Cards */}
            {testResults && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Big Five Card */}
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-black">
                      <Brain className="w-5 h-5 text-green-600" />
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
                              <span className="text-gray-700 capitalize text-sm">
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
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{ width: `${(score / 5) * 100}%` }}
                                  />
                                </div>
                                <span className="text-black font-medium w-8 text-sm">
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
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-black">
                      <Users className="w-5 h-5 text-green-700" />
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
                              <span className="text-gray-700 capitalize text-sm">
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
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${(score / 10) * 100}%` }}
                                  />
                                </div>
                                <span className="text-black font-medium w-8 text-sm">
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
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-black">
                    <Target className="w-5 h-5 text-green-600" />
                    <span>Progresso nas Trilhas</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
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
                          <span className="font-medium text-black">
                            {track.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              track.status === "Em andamento"
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-gray-100 text-gray-600 border border-gray-300"
                            }`}
                          >
                            {track.status}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {track.progress}%
                        </span>
                      </div>
                      <Progress
                        value={track.progress}
                        className="h-2 bg-gray-200"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-black">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span>Conquistas Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-all duration-300"
                    >
                      <div
                        className={`w-10 h-10 ${achievement.color} rounded-full flex items-center justify-center`}
                      >
                        <span className="text-lg">{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-black">
                          {achievement.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {achievement.date}
                        </p>
                      </div>
                      <Star className="w-4 h-4 text-green-600" />
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
