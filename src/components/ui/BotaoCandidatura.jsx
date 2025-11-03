// src/components/BotaoCandidatura.jsx - CORRIGIDO
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BotaoCandidatura({
    vaga,
    isAuthenticated,
    isSubmitting,
    jaSeCandidata,
    handleCandidatar
}) {
    const navigate = useNavigate();
    const jaCandidatou = jaSeCandidata(vaga.id);

    return (
        <div className="xl:w-50 flex-shrink-0">
            <button
                onClick={() => {
                    if (jaCandidatou || isSubmitting) return;
                    if (!isAuthenticated) {
                        navigate("/");
                    } else if (vaga.external_url) {
                        // Abrir URL externa se existir
                        window.open(vaga.external_url, '_blank');
                    } else {
                        handleCandidatar(vaga);
                    }
                }}
                disabled={jaCandidatou || isSubmitting}
                className={`w-full px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 ${jaCandidatou
                    ? "bg-green-600 cursor-default text-white"
                    : isSubmitting
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 hover:-translate-y-0.5"
                    }`}
            >
                {!isAuthenticated ? (
                    <>
                        <ExternalLink className="w-5 h-5" />
                        Fazer login
                    </>
                ) : jaCandidatou ? (
                    <>
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs font-bold">✓</span>
                        </div>
                        Candidatura enviada
                    </>
                ) : isSubmitting ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enviando...
                    </>
                ) : (
                    <>
                        <ExternalLink className="w-5 h-5" />
                        Ir para vaga
                    </>
                )}
            </button>
        </div>
    );
}