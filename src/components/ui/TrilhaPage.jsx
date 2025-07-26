import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { EditModulesModal } from "@/components/ui/EditModulesModal";
import { AddLessonModal } from "./AddLessonModal";
import { motion } from "framer-motion";
import { ChevronRight, Settings, ChevronDown, Play, Pause } from "lucide-react";
import Navbar from "./Navbar";

const TrilhaPage = () => {
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [totalTime, setTotalTime] = useState("0:00");
  const videoRef = useRef(null);
  const [showEditModules, setShowEditModules] = useState(false);
  const courseTitle = "Autoconhecimento para Aceleração de Carreiras";
  const { id: trilhaId } = useParams();

  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [currentModuleForAddingLesson, setCurrentModuleForAddingLesson] =
    useState(null);

  // Carrega os dados iniciais

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/modules")
      .then((res) => {
        const fetchedModules = res.data;

        // 🔴 Filtra os módulos com base no trilhaId
        const filteredModules = fetchedModules.filter(
          (mod) => mod.trilha_id === Number(trilhaId)
        );

        setModules(filteredModules);

        if (filteredModules.length > 0) {
          const firstModuleWithLessons = filteredModules.find(
            (m) => m.lessons && m.lessons.length > 0
          );
          if (firstModuleWithLessons) {
            selectLesson(firstModuleWithLessons.lessons[0]);
            setExpandedModules([firstModuleWithLessons.id]);
          } else {
            setExpandedModules([filteredModules[0].id]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [trilhaId]);

  // Funções de CRUD (já estão corretas)
  const handleAdd = async (title) => {
    const res = await axios.post("http://localhost:3001/api/modules", {
      title,
      trilhaId: Number(trilhaId),
    });
    setModules((old) => [...old, res.data]);
  };

  const handleEdit = async (id, title) => {
    // sua lógica
  };
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3001/api/modules/${id}`);
    setModules((old) => old.filter((m) => m.id !== id));
  };
  const handleReorder = async (newOrder) => {
    // sua lógica
  };

  const handleShowAddLessonModal = (moduleId) => {
    setCurrentModuleForAddingLesson(moduleId);
    setIsAddLessonModalOpen(true);
  };

  const handleSaveNewLesson = async (formData) => {
    try {
      // URL simples e direta
      const API_URL = "http://localhost:3001";
      const response = await axios.post(`${API_URL}/api/videos`, formData);

      // Atualizar o módulo correto com a nova aula
      setModules((prevModules) =>
        prevModules.map((module) => {
          if (module.id === Number(formData.get("moduleId"))) {
            return {
              ...module,
              lessons: [...(module.lessons || []), response.data],
            };
          }
          return module;
        })
      );

      setIsAddLessonModalOpen(false);
      console.log("Aula salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar a nova aula:", error.response?.data || error.message);
    }
  };

  // Funções de UI
  const toggleModule = (moduleId) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId] // Com o prev permite vários módulos abertos
    );
  };

  // Função simplificada para selecionar a aula. Apenas atualiza o estado.
  const selectLesson = useCallback((lesson) => {
    setSelectedLesson(lesson);
    setIsPlaying(false);
  }, []);

  // Efeito para atualizar o tempo do vídeo (já está correto)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* --- INÍCIO DA COLUNA ESQUERDA: PLAYER DE VÍDEO E CONTEÚDO --- */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-900 border-gray-800 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-black group">
                    {selectedLesson ? (
                      <video
                        key={selectedLesson.id} // ESSENCIAL: Força o React a recarregar o player ao mudar de aula
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        poster={selectedLesson.coverUrl || ""}
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
                        src={selectedLesson.videoUrl}
                        controls // Usando controles nativos por simplicidade
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <p className="text-gray-500">
                          Selecione uma aula para começar a assistir.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informações da Aula */}
              <div className="mt-6 px-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {selectedLesson?.title || "Bem-vindo!"}
                </h1>
                <p className="text-gray-400 mt-4 leading-relaxed">
                  {selectedLesson?.description ||
                    "Escolha um módulo e uma aula na lista abaixo para iniciar seus estudos."}
                </p>
              </div>
            </div>
            {/* --- FIM DA COLUNA ESQUERDA --- */}

            {/* --- INÍCIO DA COLUNA DIREITA: SIDEBAR DE MÓDULOS --- */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
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

                  <div className="space-y-2">
                    {modules.map((module) => (
                      <div
                        key={module.id}
                        className="bg-gray-800/50 border border-gray-800 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-700/50"
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
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            className="border-t border-gray-700/50"
                          >
                            {module.lessons?.length > 0 ? (
                              module.lessons.map((lesson) => (
                                <button
                                  key={lesson.id}
                                  onClick={() => selectLesson(lesson)}
                                  className={`w-full flex items-center gap-3 p-3 pl-5 text-left transition-colors ${selectedLesson?.id === lesson.id
                                    ? "bg-green-600/20 text-green-400"
                                    : "hover:bg-gray-700/50 text-gray-300"
                                    }`}
                                >
                                  <Play
                                    className={`w-4 h-4 transition-all ${selectedLesson?.id === lesson.id
                                      ? "text-green-500"
                                      : "text-gray-500"
                                      }`}
                                  />
                                  <span className="text-sm">
                                    {lesson.title}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 pl-5 text-gray-500 text-sm">
                                Nenhuma aula neste módulo.
                              </div>
                            )}

                            <div className="p-2 px-5 pb-3">
                              <button
                                onClick={() =>
                                  handleShowAddLessonModal(module.id)
                                }
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
                </CardContent>
              </Card>
            </div>
            {/* --- FIM DA COLUNA DIREITA --- */}
          </div>
        </div>
      </div>

      {/* MODAIS */}
      <EditModulesModal
        open={showEditModules}
        modules={modules}
        onClose={() => setShowEditModules(false)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
      {isAddLessonModalOpen && (
        <AddLessonModal
          moduleId={currentModuleForAddingLesson}
          onClose={() => setIsAddLessonModalOpen(false)}
          onSave={handleSaveNewLesson}
        />
      )}
    </>
  );
};

export default TrilhaPage;
