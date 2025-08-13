// src/components/AddLessonModal.jsx

import React, { useState } from 'react';

export const AddLessonModal = ({ moduleId, onClose, onSave }) => {
    // Estados para cada campo do formulário
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [videoFile, setVideoFile] = useState(null); // Estado para o arquivo de vídeo

    // Handler para o input de arquivo de vídeo
    const handleVideoFileChange = (e) => {
        if (e.target.files) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleSave = () => {
        if (!title || (!videoUrl && !videoFile)) {
            alert('Título e (URL do Vídeo OU Upload do Vídeo) são obrigatórios.');
            return;
        }

        // 1. Criar um objeto FormData para enviar arquivos
        const formData = new FormData();

        // 2. Adicionar cada campo ao formData
        formData.append('moduleId', moduleId);
        formData.append('title', title);
        formData.append('description', description);

        // Só adiciona videoUrl se tiver valor
        if (videoUrl.trim()) {
            formData.append('videoUrl', videoUrl);
        }

        // 3. Adicionar o arquivo de vídeo, se foi selecionado
        if (videoFile) {
            formData.append('videoFile', videoFile);
        }

        // 4. Chamar a função onSave, passando o FormData completo
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-white text-lg font-semibold mb-4">Adicionar Nova Aula</h2>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Título da Aula"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-gray-800 border-gray-700 rounded p-2 text-white"
                    />
                    <textarea
                        placeholder="Descrição da Aula"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-gray-800 border-gray-700 rounded p-2 text-white h-24"
                    />
                    <input
                        type="text"
                        placeholder="URL do Vídeo (opcional se fizer upload)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-gray-800 border-gray-700 rounded p-2 text-white"
                    />

                    {/* Campo para upload do vídeo */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Upload do Vídeo (opcional se usar URL)</label>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoFileChange}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="text-gray-400 hover:text-white">Cancelar</button>
                    <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Salvar Aula
                    </button>
                </div>
            </div>
        </div>
    );
};