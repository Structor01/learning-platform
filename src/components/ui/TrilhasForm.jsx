// src/components/ui/TrilhasForm.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TrilhasForm({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [hideTitleOnCover, setHideTitleOnCover] = useState(false);
  const [instructor, setInstructor] = useState("");
  const [instructorPhoto, setInstructorPhoto] = useState(null);
  const [coverVertical, setCoverVertical] = useState(null);
  const [coverHorizontal, setCoverHorizontal] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      hideTitleOnCover,
      instructor,
      instructorPhoto,
      coverVertical,
      coverHorizontal,
      videoUrl,
      videoFile,
      description,
    });
  };

  const fileLabel = (text) => (
    <div className="border border-gray-300 rounded p-2 text-center text-sm text-gray-600">
      {text}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Novo conteúdo
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Título
            </label>
            <Input
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="placeholder-gray-400 text-gray-900"
            />
            <div className="mt-2 flex items-center">
              <input
                id="hide-title"
                type="checkbox"
                checked={hideTitleOnCover}
                onChange={(e) => setHideTitleOnCover(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="hide-title" className="text-sm text-gray-600">
                Não mostrar título na foto de capa
              </label>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Nome do ministrante do curso
            </label>
            <Input
              placeholder="Por padrão será criado da comunidade (se não preenchido)"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="bg-gray-100 text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Foto do ministrante
              </label>
              {fileLabel("Dimensão recomendada: 120x120")}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setInstructorPhoto(e.target.files[0])}
                className="mt-2 w-full"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Foto de capa
              </label>
              {fileLabel("Dimensão recomendada: 480x640")}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverVertical(e.target.files[0])}
                className="mt-2 w-full"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Foto de capa horizontal
              </label>
              {fileLabel("Dimensão recomendada: 800x480")}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverHorizontal(e.target.files[0])}
                className="mt-2 w-full"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Vídeo de apresentação
            </label>
            <div className="flex space-x-2">
              <Input
                placeholder="Importar URL do youtube"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="placeholder-gray-400 text-gray-900"
              />
              <Button
                variant="ghost"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Upload
              </Button>
            </div>
            <div className="mt-2">
              <label className="block mb-1 font-medium text-gray-700">
                Ou faça upload de vídeo
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Descrição
            </label>
            <textarea
              placeholder="Descrição da trilha"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 h-32 placeholder-gray-400 text-gray-900"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="mr-2 text-gray-900"
          >
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </div>
  );
}
