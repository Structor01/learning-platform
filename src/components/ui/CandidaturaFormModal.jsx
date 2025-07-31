// src/components/ui/CandidaturaFormModal.jsx
import React, { useState } from 'react';
import { X, FileText, Send, Building2, MapPin } from 'lucide-react';

const CandidaturaFormModal = ({ isOpen, onClose, vaga, onEnviar }) => {
    const [mensagem, setMensagem] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !vaga) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onEnviar(mensagem); // ← Chama a função do pai
            setMensagem(''); // Limpar formulário
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Candidatar-se</h2>
                        <p className="text-green-100 text-sm">
                            Complete sua candidatura para esta vaga
                        </p>
                    </div>
                </div>

                {/* Informações da vaga */}
                <div className="p-6 bg-gray-50 border-b">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{vaga.nome}</h3>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>{vaga.empresa}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{vaga.cidade}, {vaga.uf}</span>
                        </div>
                    </div>

                    {vaga.modalidade && (
                        <div className="mt-2">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                {vaga.modalidade}
                            </span>
                        </div>
                    )}
                </div>

                {/* Formulário */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mensagem de apresentação
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Conte um pouco sobre você e por que tem interesse nesta vaga. Esta mensagem será enviada para o recrutador.
                            </p>
                            <textarea
                                value={mensagem}
                                onChange={(e) => setMensagem(e.target.value)}
                                placeholder="Olá! Tenho muito interesse nesta vaga porque..."
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                                maxLength={1000}
                            />
                            <div className="text-right text-xs text-gray-400 mt-1">
                                {mensagem.length}/1000 caracteres
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    'Enviando...'
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Enviar Candidatura
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CandidaturaFormModal;