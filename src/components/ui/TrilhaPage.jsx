import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { EditModulesModal } from "@/components/ui/EditModulesModal";
import { AddLessonModal } from "./AddLessonModal";
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

const TrilhaPage = () => {
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [totalTime, setTotalTime] = useState("0:00");
  const [activeTab, setActiveTab] = useState("descricao");
  const videoRef = useRef(null);
  const [showEditModules, setShowEditModules] = useState(false);
  const courseTitle = "Autoconhecimento para Aceleração de Carreiras";

  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [currentModuleForAddingLesson, setCurrentModuleForAddingLesson] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/modules")
      .then((res) => {
        const fetchedModules = res.data;
        setModules(fetchedModules);
        if (fetchedModules.length > 0) {
          setExpandedModules([fetchedModules[0].id]);
          if (fetchedModules[0].lessons?.length > 0) {
            selectLesson(fetchedModules[0].lessons[0]);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

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

  const handleShowAddLessonModal = (moduleId) => {
    setCurrentModuleForAddingLesson(moduleId);
    setIsAddLessonModalOpen(true);
  };

  const handleSaveNewLesson = async (formData) => {
    if (!currentModuleForAddingLesson) {
      alert("Erro: ID do módulo não encontrado.");
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/api/videos', formData);
      setModules(prevModules =>
        prevModules.map(module => {
          if (module.id === currentModuleForAddingLesson) {
            return { ...module, lessons: [...(module.lessons || []), response.data] };
          }
          return module;
        })
      );
      setIsAddLessonModalOpen(false);
      setCurrentModuleForAddingLesson(null);
    } catch (error) {
      console.error("Erro ao salvar a nova aula:", error.response?.data || error.message);
      alert("Não foi possível salvar a aula.");
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const selectLesson = (lesson) => {
    setSelectedLesson(lesson);
    if (videoRef.current && lesson?.videoUrl) {
      videoRef.current.src = lesson.videoUrl;
      videoRef.current.poster = lesson.coverUrl || "";
      videoRef.current.load();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleMetadata = () => {
        if (video.readyState > 0 && !isNaN(video.duration)) {
          const time = video.duration;
          const minutes = Math.floor(time / 60);
          const seconds = Math.floor(time % 60).toString().padStart(2, "0");
          setTotalTime(`${minutes}:${seconds}`);
        }
      };
      video.addEventListener("loadedmetadata", handleMetadata);
      return () => video.removeEventListener("loadedmetadata", handleMetadata);
    }
  }, [selectedLesson]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* ... seu código de player ... */}
            </div>

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
                      <div key={module.id} className="border border-gray-800 rounded-lg overflow-hidden">
                        <button onClick={() => toggleModule(module.id)} className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-800">
                          <span className="text-gray-300 font-medium">{module.title}</span>
                          {expandedModules.includes(module.id) ? <ChevronDown /> : <ChevronRight />}
                        </button>
                        {expandedModules.includes(module.id) && (
                          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-gray-800">

                            {/* --- CORREÇÃO APLICADA AQUI --- */}
                            {module.lessons?.length > 0 ? (
                              // Usamos o optional chaining AQUI também para segurança
                              module.lessons?.map((lesson) => (
                                <button
                                  key={lesson.id}
                                  onClick={() => selectLesson(lesson)}
                                  className={`w-full flex items-center p-3 pl-6 text-left hover:bg-gray-800/70 group ${selectedLesson?.id === lesson.id ? "bg-gray-800" : ""}`}
                                >
                                  <div className={`w-2 h-2 rounded-full mr-3 ${selectedLesson?.id === lesson.id ? "bg-green-500" : "bg-gray-600 group-hover:bg-green-500"}`}></div>
                                  <span className={`text-sm ${selectedLesson?.id === lesson.id ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
                                    {lesson.title}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 pl-6 text-gray-500 text-sm">Nenhuma aula neste módulo.</div>
                            )}

                            <div className="p-2 px-6">
                              <button onClick={() => handleShowAddLessonModal(module.id)} className="w-full text-left text-sm text-green-500 hover:text-green-400">
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
          </div>
        </div>
      </div>

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