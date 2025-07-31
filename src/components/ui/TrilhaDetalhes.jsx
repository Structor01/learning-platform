import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Play } from "lucide-react";

import { API_URL } from '../utils/api';

export default function TrilhaDetalhes() {
  const { id } = useParams(); // Pega o ID da trilha pela URL
  const [modules, setModules] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    axios
      .get(`${API_URL}/api/trilhas/${id}`)
      .then((res) => {
        const { titulo, modulos } = res.data;
        setCourseTitle(titulo);
        setModules(modulos || []);
      })
      .catch((err) => console.error("Erro ao buscar trilha:", err));
  }, [id]);

  const toggleModule = (moduleId) => {
    setExpandedModule((prevId) => (prevId === moduleId ? null : moduleId));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{courseTitle}</h1>

      {modules.map((modulo) => (
        <Card key={modulo.id} className="mb-4 shadow-md border border-gray-200">
          <CardContent className="p-4">
            <div
              onClick={() => toggleModule(modulo.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <h2 className="text-lg font-semibold">{modulo.title}</h2>
              {expandedModule === modulo.id ? <ChevronDown /> : <ChevronRight />}
            </div>

            {expandedModule === modulo.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4"
              >
                {modulo.lessons && modulo.lessons.length > 0 ? (
                  modulo.lessons.map((aula) => (
                    <div
                      key={aula.id}
                      className="flex items-center justify-between border rounded-md p-3 mb-2 bg-gray-50"
                    >
                      <div>
                        <h3 className="text-md font-medium">{aula.title}</h3>
                        <p className="text-sm text-gray-500">{aula.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(aula.videoUrl, "_blank")}
                      >
                        <Play className="mr-2 h-4 w-4" /> Assistir
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma aula disponível.</p>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
