import { useEffect, useState } from "react";
import { API_URL } from "../utils/api";

export const BotEntrevistaModal = ({ isOpen = true, onClose = () => { }, userId }) => {
  const [entrevista, setEntrevista] = useState(null);
  const [entrevistaNotFound, setEntrevistaNotFound] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const baseUrl = API_URL;


  useEffect(() => {
    const fetchEntrevista = async () => {
      try {
        setCarregando(true);
        setEntrevistaNotFound(false);

        if (!userId) {
          setCarregando(false);
          setEntrevistaNotFound(true);
          return;
        }

        const response = await fetch(`${baseUrl}/api/bot/get-entrevista/${userId}`);

        if (!response.ok) {
          setEntrevistaNotFound(true);
          throw new Error(`Erro ao buscar entrevista: ${response.status}`);
        }

        const result = await response.json();
        ("✅ Resposta da API:", result);

        // Verificamos se temos dados válidos
        if (result.success && result.data) {
          setEntrevista(result.data);
          setEntrevistaNotFound(false);
        } else {
          console.error("Formato de resposta inválido ou sem dados:", result);
          setEntrevistaNotFound(true);
        }
      } catch (error) {
        console.error("Erro ao buscar entrevista:", error);
        setEntrevistaNotFound(true);
      } finally {
        setCarregando(false);
      }
    };

    if (isOpen) {
      fetchEntrevista();
    }
  }, [userId, isOpen, baseUrl]);

  if (!isOpen) return null;

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando dados da entrevista...</p>
          <p className="text-gray-400 text-sm mt-2">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  if (entrevistaNotFound) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-2xl p-8 text-center max-w-md">
          <div className="text-red-400 text-5xl mb-4">😕</div>
          <h3 className="text-white text-xl font-bold mb-2">Entrevista não encontrada</h3>
          <p className="text-gray-300 mb-6">Não foi possível encontrar uma entrevista para este usuário. O usuário ainda não completou o processo de entrevista.</p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // Se não temos entrevista e não estamos mais carregando, mostrar dados vazios
  const entrevistaData = entrevista || {
    // Dados padrão caso a API não retorne nada ainda
    nome: "Não informado",
    nome_completo: "Não informado",
    cidade: "Não informado",
    email: "Não informado",
    telefone: "Não informado",
    linkdein: "Não informado",

    curso: "Não informado",

    area_atual_agro: "Não informado",
    area_atuacao_futura: "Não informado",

    posicao_atual: "Não informado",
    se_trabalha: "Não informado",
    salario_atual: "Não informado",
    mudanca: "Não informado",
    parceiros: "Não informado",

    ingles_fluente: "Não informado",
    outra_lingua: "Não informado",
    lideranca: "Não informado",
    inte_agro: "Não informado",
    diferencial: "Não informado",
    desafio_atual: "Não informado",
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              � Respostas da Entrevista
            </h2>
            <p className="text-gray-400 mt-1">
              Enviado em {entrevista?.submitted_at
                ? new Date(entrevista.submitted_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }).replace(',', ' às')
                : "Data não disponível"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Pessoais */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              📋 Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div>
                <p><strong className="text-purple-400">Nome:</strong> {entrevistaData.nome_completo || entrevistaData.nome}</p>
                <p><strong className="text-purple-400">Cidade:</strong> {entrevistaData.cidade}</p>
                <p><strong className="text-purple-400">Email:</strong> {entrevistaData.email}</p>
              </div>
              <div>
                <p><strong className="text-purple-400">Telefone:</strong> {entrevistaData.telefone}</p>
                <p><strong className="text-purple-400">LinkedIn:</strong> {entrevistaData.linkdein}</p>
              </div>
            </div>
          </div>

          {/* Educação */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              � Educação
            </h3>
            <div className="grid grid-cols-1 gap-2 text-gray-300">
              <p><strong className="text-purple-400">Curso:</strong> {entrevistaData.curso}</p>
            </div>
          </div>

          {/* Área de Atuação */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🌱 Área de Atuação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <p><strong className="text-purple-400">Área Atual Agro:</strong> {entrevistaData.area_atual_agro}</p>
              <p><strong className="text-purple-400">Área de Atuação Futura:</strong> {entrevistaData.area_atuacao_futura}</p>
            </div>
          </div>

          {/* Experiência e Trabalho */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              💼 Experiência e Trabalho
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <p><strong className="text-purple-400">Posição Atual:</strong> {entrevistaData.posicao_atual}</p>
              <p><strong className="text-purple-400">Se trabalha:</strong> {entrevistaData.se_trabalha}</p>
              <p><strong className="text-purple-400">Salário Atual:</strong> {entrevistaData.salario_atual}</p>
              <p><strong className="text-purple-400">Disposto a Mudar de Cidade:</strong> {entrevistaData.mudanca}</p>
              <p><strong className="text-purple-400">Parceria:</strong> {entrevistaData.parceiros}</p>
            </div>
          </div>

          {/* Outras Informações */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              ℹ️ Outras Informações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <p><strong className="text-purple-400">Inglês Fluente:</strong> {entrevistaData.ingles_fluente}</p>
              <p><strong className="text-purple-400">Outras Línguas:</strong> {entrevistaData.outra_lingua || 'Não informado'}</p>
              <p><strong className="text-purple-400">Liderança:</strong> {entrevistaData.lideranca}</p>
              <p><strong className="text-purple-400">Integração Agro:</strong> {entrevistaData.inte_agro}</p>
              <p><strong className="text-purple-400">Sexo:</strong> {entrevistaData.sexo}</p>
              <p><strong className="text-purple-400">Desafio Atual:</strong> {entrevistaData.desafio_atual}</p>
            </div>
          </div>

          {/* Diferencial */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🌟 Diferencial
            </h3>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {entrevistaData.diferencial}
              </p>
            </div>
          </div>

          {/* Informações de Sistema */}
          <div className="bg-blue-900/30 border border-blue-700/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              � Informações do Sistema
            </h3>
            <div className="text-blue-300">
              <p><strong>ID de Entrevista:</strong> {entrevistaData.id}</p>
              <p><strong>ID de Usuário:</strong> {entrevistaData.user_id}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};