// src/components/AddLessonModal.jsx

import React, { useState } from 'react';

export const AddLessonModal = ({ moduleId, onClose, onSave }) => {
    // Estados para cada campo do formulário
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [coverFile, setCoverFile] = useState(null); // Estado para o arquivo

    // Handler para o input de arquivo
    const handleFileChange = (e) => {
        if (e.target.files) {
            setCoverFile(e.target.files[0]);
        }
    };

    const handleSave = () => {
        if (!title || !videoUrl || !moduleId) {
            alert('Título, URL do Vídeo e ID do Módulo são obrigatórios.');
            return;
        }

        // --- INÍCIO DA CORREÇÃO ---
        // 1. Criar um objeto FormData. É assim que se envia arquivos.
        const formData = new FormData();

        // 2. Adicionar cada campo ao formData.
        // Os nomes ('title', 'videoUrl', etc.) devem ser EXATAMENTE os mesmos
        // que o seu DTO no backend espera.
        formData.append('moduleId', moduleId);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('videoUrl', videoUrl);

        // 3. Adicionar o arquivo, se ele foi selecionado.
        // O nome 'coverFile' DEVE ser o mesmo que você usou no FileInterceptor no backend.
        if (coverFile) {
            formData.append('coverFile', coverFile);
        }

        // 4. Chamar a função onSave, passando o objeto FormData completo.
        onSave(formData);
        // --- FIM DA CORREÇÃO --- // Fecha o modal após o envio

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
                        placeholder="URL do Vídeo"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-gray-800 border-gray-700 rounded p-2 text-white"
                    />

                    {/* Novo campo para upload da imagem de capa */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Imagem de Capa (Opcional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
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