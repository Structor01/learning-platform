import { EditModulesModal } from "@/components/ui/EditModulesModal";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronRight,
  Settings,
  ChevronDown,
  Star,
  Play,
  Pause,
  Volume2,
  Maximize,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  Lock,
  Award,
} from "lucide-react";

import Navbar from "./Navbar";

const TrilhaPage = () => {
  const [currentModule, setCurrentModule] = useState("boas-vindas");
  const [expandedModules, setExpandedModules] = useState(["boas-vindas"]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [totalTime] = useState("3:20");
  const [activeTab, setActiveTab] = useState("descricao");
  const videoRef = useRef(null);
  const [showCreateModule, setShowCreateModule] = useState(false);

 
  const [showEditModules, setShowEditModules] = useState(false);

  const handleSaveModules = (newModules) => {
    // Aqui você poderia salvar no backend depois, por enquanto apenas atualiza o state local
    setModules(newModules);
    setShowEditModules(false);
  };

  const trilhaData = {
    title: "Autoconhecimento para Aceleração de Carreiras",
    modules: [
      {
        id: "boas-vindas",
        title: "Boas Vindas",
        lessons: [
          {
            id: "boas-vindas-1",
            title: "Boas Vindas",
            duration: "3:20",
            completed: false,
          },
        ],
      },
      {
        id: "introducao",
        title: "Introdução",
        lessons: [
          {
            id: "intro-1",
            title: "O que é Autoconhecimento",
            duration: "5:45",
            completed: false,
          },
          {
            id: "intro-2",
            title: "Importância na Carreira",
            duration: "4:30",
            completed: false,
          },
        ],
      },
      {
        id: "dominante",
        title: "Dominante",
        lessons: [
          {
            id: "dom-1",
            title: "Características do Perfil D",
            duration: "6:15",
            completed: false,
          },
          {
            id: "dom-2",
            title: "Aplicação no Agronegócio",
            duration: "7:20",
            completed: false,
          },
        ],
      },
      {
        id: "influente",
        title: "Influente",
        lessons: [
          {
            id: "inf-1",
            title: "Características do Perfil I",
            duration: "5:50",
            completed: false,
          },
          {
            id: "inf-2",
            title: "Liderança e Comunicação",
            duration: "6:40",
            completed: false,
          },
        ],
      },
      {
        id: "estavel",
        title: "Estável",
        lessons: [
          {
            id: "est-1",
            title: "Características do Perfil S",
            duration: "5:30",
            completed: false,
          },
          {
            id: "est-2",
            title: "Trabalho em Equipe",
            duration: "6:10",
            completed: false,
          },
        ],
      },
      {
        id: "conforme",
        title: "Conforme",
        lessons: [
          {
            id: "conf-1",
            title: "Características do Perfil C",
            duration: "5:45",
            completed: false,
          },
          {
            id: "conf-2",
            title: "Análise e Precisão",
            duration: "6:25",
            completed: false,
          },
        ],
      },
      {
        id: "encerramento",
        title: "Encerramento",
        lessons: [
          {
            id: "enc-1",
            title: "Aplicando o Conhecimento",
            duration: "4:15",
            completed: false,
          },
          {
            id: "enc-2",
            title: "Próximos Passos",
            duration: "3:45",
            completed: false,
          },
        ],
      },
    ],
  };
   const [modules, setModules] = useState(trilhaData.modules);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectLesson = (moduleId, lessonId) => {
    setCurrentModule(moduleId);
    // Aqui você pode adicionar lógica para carregar o vídeo específico
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <span className="hover:text-white cursor-pointer">Início</span>
            <ChevronRight className="w-4 h-4" />
            <span className="hover:text-white cursor-pointer">Trilhas</span>
            <ChevronRight className="w-4 h-4" />
            <span className="hover:text-white cursor-pointer">
              Autoconhecimento para Aceleração de Carreiras
            </span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Boas Vindas</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player Section */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-gray-800 overflow-hidden">
                <CardContent className="p-0">
                  {/* Container principal com group para hover */}
                  <div className="relative aspect-video bg-gradient-to-br from-green-600 to-green-800 group">
                    {/* Vídeo sem controles nativos */}
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      poster="https://img.youtube.com/vi/DogH89e7Ib0/hqdefault.jpg"
                      preload="metadata"
                      src="https://d1u9wzo9e1p031.cloudfront.net/undefined/5d326a96-3536-44b8-9361-7387a15e5669/5d326a96-3536-44b8-9361-7387a15e5669.mp4#t=1"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onTimeUpdate={(e) => {
                        const time = e.target.currentTime;
                        const minutes = Math.floor(time / 60);
                        const seconds = Math.floor(time % 60)
                          .toString()
                          .padStart(2, "0");
                        setCurrentTime(`${minutes}:${seconds}`);
                      }}
                    />

                    {/* Overlay de play/pause clicável */}
                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          if (isPlaying) videoRef.current.pause();
                          else videoRef.current.play();
                        }
                        setIsPlaying(!isPlaying);
                      }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-auto transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                        {isPlaying ? (
                          <Pause className="w-10 h-10 text-white" />
                        ) : (
                          <Play className="w-10 h-10 text-white ml-1" />
                        )}
                      </div>
                    </button>

                    {/* Controles customizados */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (videoRef.current)
                                videoRef.current[
                                  isPlaying ? "pause" : "play"
                                ]();
                              setIsPlaying(!isPlaying);
                            }}
                            className="text-white hover:bg-white/20"
                          >
                            {isPlaying ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </Button>
                          <span className="text-sm">
                            {currentTime} / {totalTime}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                          >
                            <Volume2 className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              videoRef.current?.requestFullscreen()
                            }
                            className="text-white hover:bg-white/20"
                          >
                            <Maximize className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Barra de progresso dinâmica */}
                      <div className="w-full bg-white/20 rounded-full h-1 mt-3">
                        <div
                          className="bg-green-500 h-1 rounded-full"
                          style={{
                            width: `${
                              ((parseFloat(currentTime.split(":")[0]) * 60 +
                                parseFloat(currentTime.split(":")[1])) /
                                (parseFloat(totalTime.split(":")[0]) * 60 +
                                  parseFloat(totalTime.split(":")[1]))) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Lesson Info and Actions */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-white">Boas Vindas</h1>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      className="text-gray-300 hover:text-white"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Avalie essa aula
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
                      Concluir
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-800">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab("descricao")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "descricao"
                          ? "border-green-500 text-green-500"
                          : "border-transparent text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      Descrição
                    </button>
                    <button
                      onClick={() => setActiveTab("comentarios")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "comentarios"
                          ? "border-green-500 text-green-500"
                          : "border-transparent text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      Comentários (0)
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                  {activeTab === "descricao" && (
                    <div className="text-gray-300">
                      <p className="leading-relaxed">
                        Bem-vindo à trilha de Autoconhecimento para Aceleração
                        de Carreiras! Neste módulo introdutório, você conhecerá
                        os objetivos do curso e como o autoconhecimento pode ser
                        uma ferramenta poderosa para acelerar sua carreira no
                        agronegócio.
                      </p>
                      <p className="mt-4 leading-relaxed">
                        Prepare-se para uma jornada de descobertas sobre seu
                        perfil comportamental e como aplicar esse conhecimento
                        para alcançar seus objetivos profissionais.
                      </p>
                    </div>
                  )}
                  {activeTab === "comentarios" && (
                    <div className="text-gray-400 text-center py-8">
                      <p>
                        Nenhum comentário ainda. Seja o primeiro a comentar!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6">
                    {trilhaData.title}
                  </h2>

                  <div>
                    {/* → Botão de adicionar módulo */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-gray-100 text-lg font-semibold">
                        Módulos
                      </h2>
                      <button
                        onClick={() => setShowEditModules(true)}
                        className="p-2 rounded hover:bg-gray-800"
                      >
                        <Settings className="w-5 h-5 text-gray-400 hover:text-green-500" />
                      </button>
                      </div>

                      {/* Lista de módulos */}
                      <div className="space-y-2">
                        {trilhaData.modules.map((module) => (
                          <div
                            key={module.id}
                            className="border border-gray-800 rounded-lg"
                          >
                            <button
                              onClick={() => toggleModule(module.id)}
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-800 transition-colors"
                            >
                              <span className="text-gray-300 font-medium">
                                {module.title}
                              </span>
                              {expandedModules.includes(module.id) ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            {expandedModules.includes(module.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-800"
                              >
                                {module.lessons.map((lesson) => (
                                  <button
                                    key={lesson.id}
                                    onClick={() =>
                                      selectLesson(module.id, lesson.id)
                                    }
                                    className="w-full flex items-center justify-between p-3 pl-6 text-left hover:bg-gray-800 transition-colors group"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-2 h-2 bg-gray-600 rounded-full group-hover:bg-green-500"></div>
                                      <span className="text-gray-400 text-sm group-hover:text-white">
                                        {lesson.title}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {lesson.duration}
                                    </span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>

                      <EditModulesModal
                        open={showEditModules}
                        modules={modules}
                        onClose={() => setShowEditModules(false)}
                        onSave={handleSaveModules}
                      />
                    </div>

                    {/* 4) Aqui você pode renderizar condicionalmente o formulário/modal */}
                    {/* {showCreateModule && (
                      <CreateModuleModal
                        onClose={() => setShowCreateModule(false)}
                        onSave={(newModuleTitle) => {
                          // chamar sua API NestJS para criar módulo
                          // exemplo:
                          // api.post('/modules', { title: newModuleTitle, trilhaId: trilhaData.id })
                          //   .then(() => refetchModules())
                          //   .finally(() => setShowCreateModule(false))
                        }}
                      />
                    )} */}
                  

                  {/* Assessment Section */}
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Prova</p>
                          <p className="text-xs text-gray-400">
                            Conclua os módulos para liberar
                          </p>
                        </div>
                      </div>
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-900/20 border border-green-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Certificado</p>
                          <p className="text-xs text-gray-400">Bloqueado</p>
                        </div>
                      </div>
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrilhaPage;
