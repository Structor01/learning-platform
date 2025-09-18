// TrilhaAulaPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ModuloFormModal from './ModuloFormModal';

export default function TrilhaAulaPage() {
  const { id } = useParams();
  const [showModal, setShowModal] = React.useState(false);

  return (
    <div className="flex p-4 gap-4">
      <div className="flex-1">
        <video
          src="/videos/exemplo.mp4"
          controls
          className="rounded-lg w-full max-h-[400px]"
        />
        <h2 className="mt-4 text-xl font-semibold">Título da Aula</h2>
        <p className="text-gray-700">Descrição da aula e comentários aqui.</p>
      </div>

      <div className="w-72 bg-white p-4 rounded shadow space-y-2">
        <h3 className="font-semibold">Módulos</h3>
        <ul className="space-y-2">
          <li className="flex justify-between items-center bg-gray-50 p-2 rounded">
            Boas Vindas
            <button onClick={() => setShowModal(true)}>+</button>
          </li>
          {/* repetir para mais módulos */}
        </ul>
        {showModal && <ModuloFormModal onClose={() => setShowModal(false)} />}
      </div>
    </div>
  );
}