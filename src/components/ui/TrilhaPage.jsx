import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { EditModulesModal } from "@/components/ui/EditModulesModal";
import { AddLessonModal } from "./AddLessonModal";
import { motion } from "framer-motion";
import { ChevronRight, Settings, ChevronDown, Play, Pause, Edit2 } from "lucide-react";
import Navbar from "./Navbar";

const getApiUrl = () => {
  if (window.location.hostname !== 'localhost') {
    return 'https://learning-platform-backend-2x39.onrender.com';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

const API_URL = getApiUrl();


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

  useEffect(() => {
    axios
      .get(`${API_URL}/api/modules/trilha/${trilhaId}`) // ✅ Nova URL específica
      .then((res) => {
        const fetchedModules = res.data; // ✅ Já vem filtrado e ordenado!

        // ✅ LOG ESPECÍFICO DAS URLs
        fetchedModules.forEach(module => {
          module.lessons?.forEach(lesson => {
          });
        });

        setModules(fetchedModules); // ✅ Remove o filter, usa direto

        if (fetchedModules.length > 0) {
          const firstModuleWithLessons = fetchedModules.find(
            (m) => m.lessons && m.lessons.length > 0
          );
          if (firstModuleWithLessons) {
            selectLesson(firstModuleWithLessons.lessons[0]);
            setExpandedModules([firstModuleWithLessons.id]);
          } else {
            setExpandedModules([fetchedModules[0].id]);
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

  // Função para editar uma aula
  const handleEditLesson = async (lesson) => {
    const newTitle = prompt("Novo nome da aula:", lesson.title);

    if (newTitle && newTitle.trim() && newTitle !== lesson.title) {
      try {
        await axios.put(`${API_URL}/api/videos/${lesson.id}`, {
          title: newTitle.trim()
        });

        // Atualizar estado local
        setModules(prevModules =>
          prevModules.map(module => ({
            ...module,
            lessons: module.lessons?.map(l =>
              l.id === lesson.id ? { ...l, title: newTitle.trim() } : l
            )
          }))
        );

        console.log('Aula editada com sucesso!');
      } catch (error) {
        console.error('Erro ao editar aula:', error);
        alert('Erro ao editar aula');
      }
    }
  };
  // Função para deletar um módulo
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3001/api/modules/${id}`);
    setModules((old) => old.filter((m) => m.id !== id));
  };
  // Função para reordenar módulos
  const handleReorder = async (reorderedModules) => {
    try {
      // Mapear módulos com nova ordem
      const modulesWithOrder = reorderedModules.map((module, index) => ({
        id: module.id,
        order: index // Nova ordem baseada na posição
      }));

      // Chamar API para salvar nova ordem
      await axios.put(`${API_URL}/api/modules/reorder`, {
        modules: modulesWithOrder
      });

      // Atualizar estado local
      setModules(reorderedModules);

      console.log('Ordem atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao reordenar módulos:', error);
    }
  };

  const handleShowAddLessonModal = (moduleId) => {
    setCurrentModuleForAddingLesson(moduleId);
    setIsAddLessonModalOpen(true);
  };
  // Função para salvar nova aula
  // No TrilhaPage.jsx - handleSaveNewLesson atualizado:

  const handleSaveNewLesson = async (data) => {
    try {
      const API_URL = "http://localhost:3001";
      let response;

      // Se recebeu FormData (upload de arquivo)
      if (data instanceof FormData) {
        console.log('>>> ENVIANDO FORMDATA (COM ARQUIVO)');
        response = await axios.post(`${API_URL}/api/videos`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      // Se recebeu objeto JSON (só URL)
      else {
        console.log('>>> ENVIANDO JSON (SÓ URL)');
        response = await axios.post(`${API_URL}/api/videos`, data, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      // Atualizar estado local
      setModules((prevModules) =>
        prevModules.map((module) => {
          const moduleId = data instanceof FormData ?
            Number(data.get("moduleId")) :
            data.moduleId;

          if (module.id === moduleId) {
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

  // Função para editar nome do módulo
  const handleEdit = async (id, title) => {
    try {
      await axios.put(`${API_URL}/api/modules/${id}`, {
        title: title
      });

      // Atualizar estado local
      setModules(prevModules =>
        prevModules.map(module =>
          module.id === id ? { ...module, title: title } : module
        )
      );

      console.log('Módulo editado com sucesso!');
    } catch (error) {
      console.error('Erro ao editar módulo:', error);
      alert('Erro ao editar módulo');
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
                    {selectedLesson?.videoUrl ? (
                      selectedLesson.videoUrl.includes('iframe.mediadelivery.net') ? (
                        // Player Bunny.net (iframe) - CSS corrigido
                        <iframe
                          key={selectedLesson.id}
                          className="w-full h-full border-0"
                          src={selectedLesson.videoUrl}
                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                          allowFullScreen
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: 'block'
                          }}
                        />
                      ) : (
                        // Player tradicional
                        <>
                          {console.log('>>> USANDO VIDEO')}
                          <video
                            key={selectedLesson.id}
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
                            controls
                          />
                        </>
                      )
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
                                <div key={lesson.id} className="flex items-center">
                                  {/* Botão principal da aula */}
                                  <button
                                    onClick={() => selectLesson(lesson)}
                                    className={`flex-1 flex items-center gap-3 p-3 pl-5 text-left transition-colors ${selectedLesson?.id === lesson.id
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

                                  {/* Botão de editar */}
                                  <button
                                    onClick={() => handleEditLesson(lesson)}
                                    className="p-2 mr-2 text-gray-400 hover:text-blue-400 transition-colors"
                                    title="Editar aula"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </div>
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
      </div >

      {/* MODAIS */}
      < EditModulesModal
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
