import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function TrilhaPreviewModal({
  isOpen,
  onClose,
  trilha,
  onAccess,
}) {
  if (!isOpen || !trilha) return null;

  // URL de background padrão
  let backgroundUrl = "/placeholder-ministrante.jpg";
  if (typeof trilha.instructorPhoto === "string" && trilha.instructorPhoto) {
    backgroundUrl = `http://localhost:3001${trilha.instructorPhoto}`;
  } else if (
    trilha.instructorPhoto instanceof File ||
    trilha.instructorPhoto instanceof Blob
  ) {
    backgroundUrl = URL.createObjectURL(trilha.instructorPhoto);
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        <div className="flex items-center justify-center min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="relative w-full max-w-3xl min-h-[50vh] p-0 rounded-lg overflow-hidden shadow-2xl">
              {/* Imagem de fundo como "cabeçalho" */}
              <div
                className="w-full h-64 bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundUrl})` }}
              />
              {/* Conteúdo branco */}
              <div className="p-8 bg-white text-gray-800">
                <button
                  className="absolute top-3 right-3 text-white hover:text-gray-200"
                  onClick={onClose}
                >
                  <X size={24} />
                </button>

                <Dialog.Title as="h3" className="text-2xl font-bold mb-4">
                  {trilha.title}
                </Dialog.Title>
                <p className="text-base mb-6">{trilha.description}</p>
                <div className="text-right">
                  <Button
                    onClick={() => {
                      onClose();
                      onAccess(trilha);
                    }}
                  >
                    Acessar agora
                  </Button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
