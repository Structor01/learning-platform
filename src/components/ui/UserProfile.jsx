// src/components/ui/UserProfile.jsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const { user, updateUser, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [role, setRole] = useState("Executivo de Vendas");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setRole(user.role || "Executivo de Vendas");
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    await updateUser({ name, role });
    setIsEditing(false);
  };

  const discProfile = user?.discProfile || {
    dominante: 23,
    influente: 13,
    estavel: 27,
    conforme: 38,
    predominant: "Conforme",
  };

  const progress = user?.progress || {
    coursesCompleted: 0,
    certifications: 0,
    totalHours: 0,
  };

  const learningTracks = [
    { name: "Liderança Executiva", progress: 80, color: "bg-blue-500" },
    { name: "Gestão de Pessoas", progress: 60, color: "bg-green-500" },
    { name: "Estratégia Empresarial", progress: 40, color: "bg-purple-500" },
    { name: "Comunicação Eficaz", progress: 25, color: "bg-yellow-500" },
  ];

  const achievements = [
    { name: "Primeiro Curso", icon: "🎯", date: "15 Jan 2024" },
    { name: "Streak 7 dias", icon: "🔥", date: "22 Jan 2024" },
    { name: "Perfil DISC", icon: "📊", date: "18 Jan 2024" },
    { name: "Liderança Expert", icon: "👑", date: "05 Fev 2024" },
    { name: "50 Horas", icon: "⏰", date: "12 Fev 2024" },
    { name: "Mentor Ativo", icon: "🤝", date: "20 Fev 2024" },
  ];

  const discProfiles = [
    {
      name: "Dominante",
      value: discProfile.dominante,
      color: "bg-red-500",
      letter: "D",
    },
    {
      name: "Influente",
      value: discProfile.influente,
      color: "bg-green-500",
      letter: "I",
    },
    {
      name: "Estável",
      value: discProfile.estavel,
      color: "bg-blue-500",
      letter: "S",
    },
    {
      name: "Conforme",
      value: discProfile.conforme,
      color: "bg-orange-500",
      letter: "C",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
            {isEditing ? (
              <Button onClick={handleSave}>Salvar</Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={name} />
                  <AvatarFallback className="bg-gray-600 text-white text-2xl">
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {isEditing ? (
                  <input
                    className="text-xl font-bold text-center text-gray-900 mb-1 w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {name}
                  </h2>
                )}
                {isEditing ? (
                  <input
                    className="text-gray-600 mb-2 text-center w-full"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                ) : (
                  <p className="text-gray-600 mb-2">{role}</p>
                )}
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" /> Membro desde Janeiro
                  2024
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Seu Perfil DISC</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {discProfiles.map((profile) => (
                    <div key={profile.name} className="text-center">
                      <div
                        className={`w-16 h-16 ${profile.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                      >
                        <span className="text-white text-xl font-bold">
                          {profile.letter}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {profile.name}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {profile.value}%
                      </p>
                    </div>
                  ))}
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    Perfil predominante
                  </p>
                  <p className="text-lg font-bold text-orange-600">
                    {discProfile.predominant}
                  </p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Download className="w-4 h-4 mr-2" /> Baixar certificado do
                  teste de perfil
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {progress.coursesCompleted}
                  </p>
                  <p className="text-sm text-gray-600">Cursos Concluídos</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {progress.certifications}
                  </p>
                  <p className="text-sm text-gray-600">Certificações Obtidas</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {progress.totalHours}
                  </p>
                  <p className="text-sm text-gray-600">
                    Horas Totais de Estudo
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Progresso nas Trilhas</span>
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600">
                    Ver detalhes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {learningTracks.map((track, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {track.name}
                        </span>
                        <span className="text-sm font-medium text-gray-600">
                          {track.progress}%
                        </span>
                      </div>
                      <Progress value={track.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Conquistas Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="text-2xl">{a.icon}</div>
                      <div>
                        <p className="font-medium text-gray-900">{a.name}</p>
                        <p className="text-sm text-gray-500">{a.date}</p>
                      </div>
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
