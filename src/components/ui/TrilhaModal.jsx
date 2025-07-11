// TrilhaModal.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function TrilhaModal({ trilha, onClose }) {
  const navigate = useNavigate();

  const acessar = () => {
    navigate(`/trilhas/${trilha.id}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden shadow-xl relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        <img
          src={trilha.imagem}
          alt={trilha.titulo}
          className="h-64 w-full object-cover"
        />

        <div className="p-4 space-y-2">
          <Button onClick={acessar}>▶ Acessar agora</Button>
          <h2 className="text-xl font-bold mt-2">{trilha.titulo}</h2>
          <p>{trilha.descricao}</p>
          <div className="text-sm text-gray-600">
            <p>{trilha.aulas} aula(s)</p>
            <p>{trilha.modulos} módulo(s)</p>
            <p>Ministrado por <strong>{trilha.ministradoPor}</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}