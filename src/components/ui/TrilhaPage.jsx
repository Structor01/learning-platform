import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { EditModulesModal } from "@/components/ui/EditModulesModal";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Settings,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  Maximize,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  Lock,
  Award,
  Star,
} from "lucide-react";
import Navbar from "./Navbar";
import { AddLessonModal } from "./AddLessonModal";
const TrilhaPage = () => {
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [currentModuleForAddingLesson, setCurrentModuleForAddingLesson] = useState(null);
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null); // Guarda a aula selecionada
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [totalTime, setTotalTime] = useState("0:00");
  const [activeTab, setActiveTab] = useState("descricao");
  const videoRef = useRef(null);
  const [showEditModules, setShowEditModules] = useState(false);
  const courseTitle = "Autoconhecimento para Aceleração de Carreiras";

  // Função que abre o modal
  const handleShowAddLessonModal = (moduleId) => {
    setCurrentModuleForAddingLesson(moduleId);
    setIsAddLessonModalOpen(true);
  };

  // Função que salva a nova aula
  const handleSaveNewLesson = async (lessonData) => {
    try {
      // Chama a API que criamos no passo anterior
      const response = await axios.post('http://localhost:3001/api/videos', lessonData);

      // ATUALIZA O ESTADO LOCAL para que a nova aula apareça imediatamente
      setModules(prevModules => {
        return prevModules.map(module => {
          if (module.id === lessonData.moduleId) {
            // Adiciona a nova aula à lista de aulas do módulo correto
            return { ...module, lessons: [...module.lessons, response.data] };
          }
          return module;
        });
      });

    } catch (error) {
      console.error("Erro ao salvar a nova aula:", error);
      alert("Não foi possível salvar a aula.");
    }
  };

  // Carrega os módulos e aulas do backend
  useEffect(() => {
    axios
      .get("http://localhost:3001/api/modules") // Endpoint que deve retornar módulos com suas aulas
      .then((res) => {
        const fetchedModules = res.data;
        setModules(fetchedModules);

        // Seleciona a primeira aula do primeiro módulo como padrão
        if (fetchedModules.length > 0 && fetchedModules[0].lessons.length > 0) {
          setSelectedLesson(fetchedModules[0].lessons[0]);
          setExpandedModules([fetchedModules[0].id]); // Abre o primeiro módulo
        }
      })
      .catch((err) => console.error("Falha ao carregar módulos:", err));
  }, []);

  // Atualiza a duração total do vídeo quando uma nova aula é carregada
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleMetadata = () => {
        if (!isNaN(video.duration)) {
          const time = video.duration;
          const minutes = Math.floor(time / 60);
          const seconds = Math.floor(time % 60).toString().padStart(2, "0");
          setTotalTime(`${minutes}:${seconds}`);
        }
      };
      video.addEventListener("loadedmetadata", handleMetadata);
      return () => video.removeEventListener("loadedmetadata", handleMetadata);
    }
  }, [selectedLesson]); // Executa sempre que a aula selecionada mudar

  // Callbacks para o modal de edição de módulos (CRUD)
  const handleAdd = async (title) => {
    const res = await axios.post("http://localhost:3001/api/modules", { title });
    setModules((old) => [...old, res.data]);
  };
  const handleEdit = async (id, title) => {
    await axios.put(`http://localhost:3001/api/modules/${id}`, { title });
    setModules((old) => old.map((m) => (m.id === id ? { ...m, title } : m)));
  };
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3001/api/modules/${id}`);
    setModules((old) => old.filter((m) => m.id !== id));
  };
  const handleReorder = async (newOrder) => {
    await axios.put("http://localhost:3001/api/modules/reorder", { modules: newOrder });
    const res = await axios.get("http://localhost:3001/api/modules");
    setModules(res.data);
  };

  // Funções de UI
  const toggleModule = (moduleId) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.load(); // Força o browser a carregar o novo src
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb dinâmico */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <span className="hover:text-white cursor-pointer">Início</span>
            <ChevronRight className="w-4 h-4" />
            <span className="hover:text-white cursor-pointer">Trilhas</span>
            <ChevronRight className="w-4 h-4" />
            <span className="hover:text-white cursor-pointer">{courseTitle}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{selectedLesson?.title || "Selecione uma aula"}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seção do Player de Vídeo */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-gray-800 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-black group">
                    <video
                      key={selectedLesson?.id} // Força o recarregamento ao mudar de aula
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      poster={selectedLesson?.posterUrl}
                      preload="metadata"
                      src={selectedLesson?.videoUrl}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onTimeUpdate={(e) => {
                        const time = e.target.currentTime;
                        const minutes = Math.floor(time / 60);
                        const seconds = Math.floor(time % 60).toString().padStart(2, "0");
                        setCurrentTime(`${minutes}:${seconds}`);
                      }}
                    />

                    {/* Seus controles customizados (já funcionam com o estado `isPlaying`) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          isPlaying ? videoRef.current.pause() : videoRef.current.play();
                        }
                      }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-auto transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                        {isPlaying ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white ml-1" />}
                      </div>
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                      {/* ... Seu código de controles aqui (botão play, tempo, volume, progresso) ... */}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações e Ações da Aula */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-white">{selectedLesson?.title || "Selecione uma Aula"}</h1>
                  {/* ... seus botões de ação ... */}
                </div>

                <div className="border-b border-gray-800">
                  {/* ... suas abas de navegação ... */}
                </div>

                <div className="mt-6">
                  {activeTab === "descricao" && (
                    <div className="text-gray-300">
                      <p className="leading-relaxed">
                        {selectedLesson?.description || "A descrição da aula aparecerá aqui."}
                      </p>
                    </div>
                  )}
                  {/* ... outro conteúdo das abas ... */}
                </div>
              </div>
            </div>

            {/* Sidebar com Módulos e Aulas */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-gray-100 text-lg font-semibold">Módulos</h2>
                    <button onClick={() => setShowEditModules(true)} className="p-2 rounded hover:bg-gray-800">
                      <Settings className="w-5 h-5 text-gray-400 hover:text-green-500" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {modules.map((module) => (
                      <div key={module.id} className="border border-gray-800 rounded-lg">
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-800 transition-colors"
                        >
                          <span className="text-gray-300 font-medium">{module.title}</span>
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
                            {module.lessons?.length > 0 ? (
                              module.lessons.map((lesson) => (
                                <button
                                  key={lesson.id}
                                  onClick={() => selectLesson(lesson)}
                                  className={`w-full flex items-center justify-between p-3 pl-6 text-left hover:bg-gray-800 transition-colors group ${selectedLesson?.id === lesson.id ? "bg-gray-800" : ""
                                    }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-2 h-2 rounded-full ${selectedLesson?.id === lesson.id ? "bg-green-500" : "bg-gray-600 group-hover:bg-green-500"}`}></div>
                                    <span className={`text-sm group-hover:text-white ${selectedLesson?.id === lesson.id ? "text-white" : "text-gray-400"}`}>
                                      {lesson.title || "Nome do Submenu"}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">{lesson.duration || "0:00"}</span>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 pl-6 text-gray-500 text-sm">Nenhuma aula neste módulo.</div>
                            )}
                            {/* --- BOTÃO PARA ADICIONAR NOVA AULA --- */}
                            <div className="p-2 pl-6">
                              <button
                                // 1. Precisamos criar a função handleShowAddLessonModal
                                onClick={() => handleShowAddLessonModal(module.id)}
                                className="w-full text-left text-sm text-green-500 hover:text-green-400"
                              >
                                + Adicionar Aula
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                  {isAddLessonModalOpen && (
                    <>
                      <AddLessonModal
                        moduleId={currentModuleForAddingLesson}
                        onClose={() => setIsAddLessonModalOpen(false)}
                        onSave={handleSaveNewLesson}
                      />
                      <EditModulesModal
                        open={showEditModules}
                        modules={modules}
                        onClose={() => setShowEditModules(false)}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onReorder={handleReorder}
                      />
                    </>
                  )}

                  {/* Seção de Prova e Certificado */}
                  <div className="mt-8 space-y-4">
                    {/* ...seu código da prova e certificado... */}
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