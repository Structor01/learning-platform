import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar Exclusão",
  message = "Tem certeza que deseja excluir este item?",
  confirmText = "Excluir",
  cancelText = "Cancelar",
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-900 border border-gray-800 shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-600/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {title}
              </h2>
            </div>
            
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-gray-300 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50 font-medium"
              >
                {cancelText}
              </button>
              
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50 font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {confirmText}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;