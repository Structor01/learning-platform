import { useParams } from "react-router-dom";
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { EditModulesModal } from "@/components/ui/EditModulesModal";
import { AddLessonModal } from "./AddLessonModal";
import { motion } from "framer-motion";
import { ChevronRight, Settings, ChevronDown, Play, Pause, Edit2, Trash } from "lucide-react";
import Navbar from "./Navbar";
import { API_URL } from "../utils/api";


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

  // Funções para processar URLs do YouTube
  const isYouTubeURL = (url) => {
    return url.includes('youtube.com/watch') || url.includes('youtu.be/');
  };

  const extractYouTubeData = (url) => {
    const regexPatterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,  // youtube.com/watch?v=
      /(?:youtu\.be\/)([^&\n?#]+)/               // youtu.be/
    ];

    let videoId = null;
    for (const pattern of regexPatterns) {
      const match = url.match(pattern);
      if (match) {
        videoId = match[1];
        break;
      }
    }

    if (!videoId) return null;

    // Extrair tempo de início se existir
    const timeMatch = url.match(/[?&]t=(\d+)s?/) || url.match(/[?&]start=(\d+)/);
    const startTime = timeMatch ? parseInt(timeMatch[1]) : 0;

    return {
      videoId,
      startTime
    };
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/api/modules/trilha/${trilhaId}`) // ✅ Nova URL específica
      .then((res) => {
        const fetchedModules = res.data; // ✅ Já vem filtrado e ordenado!

        // ✅ Processar URLs do YouTube existentes
        const processedModules = fetchedModules.map(module => ({
          ...module,
          lessons: module.lessons?.map(lesson => {
            // Se é URL do YouTube mas não tem videoType definido
            if (lesson.videoUrl && isYouTubeURL(lesson.videoUrl) && !lesson.videoType) {
              const youtubeData = extractYouTubeData(lesson.videoUrl);
              if (youtubeData) {
                return {
                  ...lesson,
                  videoType: 'youtube',
                  youtubeId: youtubeData.videoId,
                  startTime: youtubeData.startTime
                };
              }
            }
            return lesson;
          }) || []
        }));

        setModules(processedModules);

        if (processedModules.length > 0) {
          const firstModuleWithLessons = processedModules.find(
            (m) => m.lessons && m.lessons.length > 0
          );
          if (firstModuleWithLessons) {
            selectLesson(firstModuleWithLessons.lessons[0]);
            setExpandedModules([firstModuleWithLessons.id]);
          } else {
            setExpandedModules([processedModules[0].id]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [trilhaId]);

  // Funções de CRUD (já estão corretas)
  const handleAdd = async (title) => {
    const res = await axios.post(`${API_URL}/api/modules`, {
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

  // Função para deletar uma aula
  const handleDeleteLesson = async (lesson) => {
    if (confirm(`Tem certeza que deseja deletar a aula "${lesson.title}"?`)) {
      try {
        await axios.delete(`${API_URL}/api/videos/${lesson.id}`);

        // Atualizar estado local
        setModules(prevModules =>
          prevModules.map(module => ({
            ...module,
            lessons: module.lessons?.filter(l => l.id !== lesson.id) || []
          }))
        );

        // Se a aula deletada estava selecionada, limpar seleção
        if (selectedLesson?.id === lesson.id) {
          setSelectedLesson(null);
        }

        console.log('Aula deletada com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar aula:', error);
        alert('Erro ao deletar aula');
      }
    }
  };

  // Função para deletar um módulo
  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/api/modules/${id}`);
    setModules((old) => old.filter((m) => m.id !== id));
  };
  // Função para reordenar módulos
  const handleReorder = async (reorderedModules) => {
    try {
      // Mapear módulos com nova ordem (começando do 1 ao invés de 0)
      const modulesWithOrder = reorderedModules.map((module, index) => ({
        id: module.id,
        order: index + 1 // Nova ordem baseada na posição (1, 2, 3, ...)
      }));

      // Chamar API para salvar nova ordem
      const response = await axios.put(`${API_URL}/api/modules/reorder`, {
        modules: modulesWithOrder
      });

      // Verificar se a resposta foi bem-sucedida
      if (response.status === 200) {
        // Atualizar estado local com a nova ordem
        setModules(reorderedModules);
        console.log('Ordem atualizada com sucesso!');
      } else {
        throw new Error('Falha na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao reordenar módulos:', error);
      // Reverter para a ordem original se houver erro
      alert('Erro ao salvar nova ordem. Tente novamente.');
    }
  };

  const handleShowAddLessonModal = (moduleId) => {
    setCurrentModuleForAddingLesson(moduleId);
    setIsAddLessonModalOpen(true);
  };
  // Função para salvar nova aula
  // No TrilhaPage.jsx - handleSaveNewLesson atualizado:

  const handleSaveNewLesson = async (data) => {
    console.log("🚀 FUNÇÃO INICIADA - data recebida:", data);
    try {
      let response;

      // Função para detectar se é iframe
      const isYouTubeIframe = (text) => {
        return text.trim().startsWith('<iframe') && text.includes('youtube.com/embed');
      };

      // Função para extrair dados do iframe
      const extractFromYouTubeIframe = (iframeText) => {
        const srcMatch = iframeText.match(/src="([^"]*)/);
        if (!srcMatch) return null;

        const embedUrl = srcMatch[1];
        const cleanUrl = embedUrl.replace(/&amp;/g, '&');

        const videoIdMatch = cleanUrl.match(/\/embed\/([^?&]+)/);
        if (!videoIdMatch) return null;

        const videoId = videoIdMatch[1];
        const startMatch = cleanUrl.match(/[?&]start=(\d+)/);
        const startTime = startMatch ? parseInt(startMatch[1]) : 0;

        return { videoId, startTime };
      };


      console.log("🔍 Testando detecções:");
      console.log("É FormData?", data instanceof FormData);
      console.log("Tem videoUrl?", !!data.videoUrl);

      if (data.videoUrl) {
        console.log("Texto começa com <iframe?", data.videoUrl.trim().startsWith('<iframe'));
        console.log("Contém youtube.com/embed?", data.videoUrl.includes('youtube.com/embed'));
        console.log("isYouTubeIframe resultado:", isYouTubeIframe(data.videoUrl));
      }

      // Se recebeu FormData (upload de arquivo)
      if (data instanceof FormData) {
        console.log('>>> ENVIANDO FORMDATA (COM ARQUIVO)');
        response = await axios.post(`${API_URL}/api/videos`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      // Se recebeu iframe do YouTube
      else if (data.videoUrl && isYouTubeIframe(data.videoUrl)) {
        console.log('>>> PROCESSANDO IFRAME DO YOUTUBE');

        const youtubeData = extractFromYouTubeIframe(data.videoUrl);
        console.log('>>> Dados extraídos:', youtubeData);

        if (youtubeData) {
          const finalData = {
            ...data,
            videoType: 'youtube',
            youtubeId: youtubeData.videoId,
            startTime: youtubeData.startTime,
            videoUrl: `https://www.youtube.com/embed/${youtubeData.videoId}${youtubeData.startTime ? `?start=${youtubeData.startTime}` : ''}`,
            thumbnailUrl: `https://img.youtube.com/vi/${youtubeData.videoId}/maxresdefault.jpg`
          };

          console.log('>>> Enviando para API:', finalData);

          response = await axios.post(`${API_URL}/api/videos`, finalData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } else {
          throw new Error('Não foi possível processar o iframe do YouTube');
        }
      }
      // Se recebeu URL do YouTube
      else if (data.videoUrl && isYouTubeURL(data.videoUrl)) {
        console.log('>>> ENVIANDO VÍDEO DO YOUTUBE');

        const youtubeData = extractYouTubeData(data.videoUrl);

        const finalData = {
          ...data,
          videoType: 'youtube',
          youtubeId: youtubeData.videoId,
          startTime: youtubeData.startTime,
          thumbnailUrl: `https://img.youtube.com/vi/${youtubeData.videoId}/maxresdefault.jpg`
        };

        response = await axios.post(`${API_URL}/api/videos`, finalData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      // Se recebeu objeto JSON (URL comum)
      else {
        console.log('>>> ENVIANDO JSON (URL COMUM)');
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
      console.error("=== ERRO DETALHADO ===");
      console.error("Status:", error.response?.status);
      console.error("Data completa:", error.response?.data);
      console.error("Message:", error.message);
      console.error("Error completo:", error);
      console.error("======================");
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
                        // Player Bunny.net (iframe)
                        <iframe
                          key={selectedLesson.id}
                          className="w-full-screen h-full border-0"
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
                      ) : (selectedLesson.videoType === 'youtube' && selectedLesson.youtubeId) || 
                           (selectedLesson.content && selectedLesson.content.includes('youtube.com')) ? (
                        // Player YouTube (iframe)
                        <>
                          {console.log('🔍 selectedLesson completo:', selectedLesson)}
                          <iframe
                            key={selectedLesson.id}
                            className="w-full h-full border-0"
                            src={`https://www.youtube.com/embed/${
                              selectedLesson.youtubeId || 
                              (selectedLesson.content && selectedLesson.content.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^?&\n]+)/)?.[1]) ||
                              'dQw4w9WgXcQ'
                            }${selectedLesson.startTime ? `?start=${selectedLesson.startTime}` : ''}`}
                            title={selectedLesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ aspectRatio: '16/9' }}
                          />
                        </>
                      ) : (
                        // Player tradicional
                        <>
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
                                    className="p-2 mr-1 text-gray-400 hover:text-blue-400 transition-colors"
                                    title="Editar aula"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  {/* Botão de deletar */}
                                  <button
                                    onClick={() => handleDeleteLesson(lesson)}
                                    className="p-2 mr-2 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Deletar aula"
                                  >
                                    <Trash className="w-4 h-4" />
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
