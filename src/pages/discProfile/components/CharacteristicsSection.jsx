import { Sparkles } from "lucide-react";

const CharacteristicsSection = ({ aiReport, generatingReport }) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white bg-gray-800 px-3 py-2">CARACTERÍSTICAS GERAIS</h3>
        {aiReport?.isAIGenerated && (
          <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Gerado por IA</span>
          </div>
        )}
        {generatingReport && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Analisando...</span>
          </div>
        )}
      </div>
      <div className="text-sm">
        {aiReport?.structuredData?.caracteristicasGerais ? (
          <div className="space-y-3">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {aiReport.structuredData.caracteristicasGerais}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            {generatingReport ? (
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">IA analisando suas características gerais...</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacteristicsSection;