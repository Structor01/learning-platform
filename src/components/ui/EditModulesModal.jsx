import React, { useState } from 'react';
import { X, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export function EditModulesModal({ open, modules, onClose, onSave }) {
  const [draft, setDraft] = useState(modules);
  const [newTitle, setNewTitle] = useState('');

  if (!open) return null;

  // Função para adicionar novo módulo
  const handleAdd = () => {
    if (!newTitle.trim()) return;
    setDraft([
      ...draft,
      { id: Date.now().toString(), title: newTitle.trim() }
    ]);
    setNewTitle('');
  };

  // Função para editar título no draft
  const handleEdit = (id) => {
    const title = prompt('Novo nome do módulo:');
    if (title != null) {
      setDraft(draft.map(m => m.id === id ? { ...m, title } : m));
    }
  };

  // Função para excluir um módulo
  const handleDelete = (id) => {
    if (window.confirm('Deseja mesmo excluir este módulo?')) {
      setDraft(draft.filter(m => m.id !== id));
    }
  };

  // Reordena ao soltar
  const onDragEnd = result => {
    if (!result.destination) return;
    const items = Array.from(draft);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setDraft(items);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Editar módulos</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600 hover:text-black" />
          </button>
        </div>

        {/* Novo módulo */}
        <div className="flex mb-4 space-x-2">
          <input
            type="text"
            placeholder="Nome"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="flex-1 border px-3 py-2 rounded focus:outline-none"
          />
          <button
            onClick={handleAdd}
            className="text-blue-600 hover:underline"
          >
            Adicionar
          </button>
        </div>

        {/* Lista com drag-and-drop */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="modules">
            {provided => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 max-h-60 overflow-auto"
              >
                {draft.map((mod, idx) => (
                  <Draggable key={mod.id} draggableId={mod.id} index={idx}>
                    {prov => (
                      <li
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className="flex items-center justify-between bg-gray-100 p-2 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            {...prov.dragHandleProps}
                            className="cursor-move"
                          >
                            <GripVertical className="w-5 h-5 text-gray-500" />
                          </span>
                          <span>{mod.title}</span>
                        </div>
                        <div className="space-x-4 text-sm">
                          <button
                            onClick={() => handleEdit(mod.id)}
                            className="text-blue-600 hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(mod.id)}
                            className="text-red-600 hover:underline"
                          >
                            Excluir
                          </button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        {/* Ações finais */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(draft)}
            className="px-4 py-2 rounded bg-green-800 text-white hover:bg-green-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
