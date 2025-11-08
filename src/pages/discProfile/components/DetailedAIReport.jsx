import { Sparkles } from "lucide-react";

const DetailedAIReport = ({ aiReport }) => {
  if (!aiReport) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-200 p-8">
      <div className="flex items-center mb-6">
        <Sparkles className="w-6 h-6 text-purple-600 mr-3" />
        <h3 className="text-2xl font-bold text-gray-900">
          Relatório Detalhado {aiReport.isAIGenerated ? '(Gerado por IA)' : '(Relatório Padrão)'}
        </h3>
      </div>

      <div className="grid gap-6">
        {aiReport.sections.analiseComportamental && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Análise Comportamental Detalhada</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {aiReport.sections.analiseComportamental}
            </p>
          </div>
        )}

        {aiReport.sections.pontosFortesEspecificos && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Pontos Fortes Específicos</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {aiReport.sections.pontosFortesEspecificos}
            </p>
          </div>
        )}

        {aiReport.sections.areasDesenvolvimento && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Áreas de Desenvolvimento</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {aiReport.sections.areasDesenvolvimento}
            </p>
          </div>
        )}

        {aiReport.sections.estrategiasComunicacao && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Estratégias de Comunicação</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {aiReport.sections.estrategiasComunicacao}
            </p>
          </div>
        )}

        {aiReport.sections.dicasLideranca && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Dicas para Liderança</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {aiReport.sections.dicasLideranca}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Relatório gerado em: {new Date(aiReport.generatedAt).toLocaleString('pt-BR')}
        </div>
      </div>
    </div>
  );
};

export default DetailedAIReport;