// TrilhasPage.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import TrilhaModal from "./TrilhaModal";

const trilhasExemplo = [
  {
    id: 1,
    titulo: "Autoconhecimento para Carreiras",
    imagem: "/imgs/autoconhecimento.jpg",
    descricao: "Treinamento para aceleração de carreiras.",
    aulas: 8,
    modulos: 7,
    ministradoPor: "Ana Carolina Cavalcanti",
  },
  // adicione mais trilhas aqui se quiser testar
];

export default function TrilhasPage() {
  const [trilhaSelecionada, setTrilhaSelecionada] = useState(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Trilhas</h1>
        <Button onClick={() => alert("Adicionar nova trilha")}>
          Adicionar Trilhas
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {trilhasExemplo.map((trilha) => (
          <div
            key={trilha.id}
            className="cursor-pointer shadow rounded-lg overflow-hidden"
            onClick={() => setTrilhaSelecionada(trilha)}
          >
            <img
              src={trilha.imagem}
              alt={trilha.titulo}
              className="h-40 w-full object-cover"
            />
            <div className="p-2 font-bold text-white bg-black">
              {trilha.titulo}
            </div>
          </div>
        ))}
      </div>

      {trilhaSelecionada && (
        <TrilhaModal
          trilha={trilhaSelecionada}
          onClose={() => setTrilhaSelecionada(null)}
        />
      )}
    </div>
  );
}
