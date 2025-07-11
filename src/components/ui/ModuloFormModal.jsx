// ModuloFormModal.jsx
import React from "react";
import { Button } from "@/components/ui/button";

export default function ModuloFormModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow max-w-xl w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Novo Conteúdo</h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium">Tipo</label>
            <div className="flex gap-4 mt-2">
              <label>
                <input type="radio" name="tipo" defaultChecked /> Vídeo
              </label>
              <label>
                <input type="radio" name="tipo" /> Link
              </label>
              <label>
                <input type="radio" name="tipo" /> Texto
              </label>
              <label>
                <input type="radio" name="tipo" /> PDF
              </label>
            </div>
          </div>

          <div>
            <label className="block">Arquivo</label>
            <input type="file" className="w-full border p-2" />
          </div>

          <div>
            <label className="block">Nome do conteúdo</label>
            <input type="text" className="w-full border p-2" />
          </div>

          <div>
            <label className="block">Título da descrição</label>
            <input type="text" className="w-full border p-2" />
          </div>

          <div>
            <label className="block">Descrição</label>
            <textarea className="w-full border p-2" rows="3" />
          </div>

          <div>
            <label className="block">Arquivos complementares</label>
            <div className="border p-4 text-center text-gray-500">
              Clique aqui para adicionar um arquivo
            </div>
          </div>

          <Button className="mt-4">Salvar</Button>
        </div>
      </div>
    </div>
  );
}
