import { Sparkles } from "lucide-react";

const DevelopmentAreasSection = ({ developmentAreas, aiReport, generatingReport }) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white bg-gray-800 px-3 py-2">ÁREAS DE DESENVOLVIMENTO</h3>
        {aiReport?.isAIGenerated && (
          <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Gerado por IA</span>
          </div>
        )}
      </div>
      {developmentAreas.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">Para maximizar seu potencial, considere desenvolver as seguintes áreas:</p>
          <div className="space-y-3">
            {developmentAreas.map((area, index) => (
              <div key={index} className="border-l-3 border-yellow-400 pl-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{area.area}</h4>
                <p className="text-xs text-gray-700 leading-relaxed">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          {generatingReport ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">IA identificando áreas de desenvolvimento...</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default DevelopmentAreasSection;