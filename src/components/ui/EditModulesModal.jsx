import React, { useEffect, useState } from "react";
import { X, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export function EditModulesModal({
  open,
  modules,
  onClose,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}) {
  const [draft, setDraft] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(modules);
    }
  }, [open, modules]);

  if (!open) return null;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim());
    setNewTitle("");
  };

  const handleEdit = (id) => {
    const title = prompt("Novo nome do módulo:");
    if (title != null) {
      onEdit(id, title);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Deseja mesmo excluir este módulo?")) {
      onDelete(id);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(draft);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setDraft(items);
    onReorder(items);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Editar módulos</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600 hover:text-black" />
          </button>
        </div>

        <div className="flex mb-4 space-x-2">
          <input
            type="text"
            placeholder="Nome"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 border px-3 py-2 rounded focus:outline-none"
          />
          <button onClick={handleAdd} className="text-blue-600 hover:underline">
            Adicionar
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="modules" isDropDisabled={false}>
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 max-h-60 overflow-auto"
              >
                {draft.map((mod, idx) => (
                  <Draggable
                    key={mod.id}
                    draggableId={mod.id.toString()}
                    index={idx}
                  >
                    {(prov) => (
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

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
