// src/components/AddLessonModal.jsx (Exemplo simplificado)
import { useState } from 'react';

export const AddLessonModal = ({ moduleId, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    // ... outros campos como description ...

    const handleSave = () => {
        if (!title || !moduleId) {
            alert('Título é obrigatório.');
            return;
        }
        // 3. Chama a função de salvar passando todos os dados
        onSave({ title, videoUrl, moduleId });
        onClose(); // Fecha o modal
    };

    return (
        <div className="modal-overlay"> {/* Estilize para ser um modal */}
            <div className="modal-content">
                <h2>Adicionar Nova Aula</h2>

                {/* Campo do Título */}
                <input
                    type="text"
                    placeholder="Título da Aula"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* Campo da URL do Vídeo */}
                <input
                    type="text"
                    placeholder="https://nichoos-teste-convert.s3.us-east-2.amazonaws.com/undefined/5d326a96-3536-44b8-9361-7387a15e5669/5d326a96-3536-44b8-9361-7387a15e5669.mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                />

                <button onClick={handleSave}>Salvar Aula</button>
                <button onClick={onClose}>Cancelar</button>
            </div>
        </div>
    );
};