import { Sparkles } from "lucide-react";

const StrengthsSection = ({ strengths, aiReport, generatingReport }) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white bg-gray-800 px-3 py-2">PONTOS FORTES</h3>
        {aiReport?.isAIGenerated && (
          <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Gerado por IA</span>
          </div>
        )}
      </div>
      {strengths.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {strengths.map((category, index) => (
            <div key={index} className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900">{category.title}</h4>
              <ul className="text-xs text-gray-700 space-y-1">
                {category.items.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          {generatingReport ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">IA analisando seus pontos fortes...</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StrengthsSection;