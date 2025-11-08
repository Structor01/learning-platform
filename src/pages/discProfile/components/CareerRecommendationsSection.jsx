import { Sparkles } from "lucide-react";

const CareerRecommendationsSection = ({ careerRecommendations, aiReport, generatingReport }) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white bg-gray-800 px-3 py-2">RECOMENDAÇÕES DE CARREIRA</h3>
        {aiReport?.isAIGenerated && (
          <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Gerado por IA</span>
          </div>
        )}
      </div>
      {careerRecommendations.length > 0 ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Áreas de Carreira Personalizadas para seu Perfil:</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {careerRecommendations.map((category, index) => {
                const colorClasses = {
                  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', textLight: 'text-blue-700', dot: 'bg-blue-500' },
                  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', textLight: 'text-green-700', dot: 'bg-green-500' },
                  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', textLight: 'text-purple-700', dot: 'bg-purple-500' },
                  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', textLight: 'text-orange-700', dot: 'bg-orange-500' }
                };
                const colors = colorClasses[category.color] || colorClasses.blue;
                
                return (
                  <div key={index} className={`${colors.bg} p-3 rounded border ${colors.border}`}>
                    <h5 className={`text-xs font-semibold ${colors.text} mb-2`}>{category.category}</h5>
                    <ul className={`text-xs ${colors.textLight} space-y-1`}>
                      {category.positions.map((position, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <div className={`w-1 h-1 ${colors.dot} rounded-full`}></div>
                          <span>{position}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded border-l-4 border-purple-400">
            <p className="text-xs text-purple-800">
              <strong>Análise IA:</strong> Essas recomendações foram geradas especificamente para suas pontuações únicas do teste DISC, 
              considerando suas características dominantes e complementares para uma orientação profissional personalizada.
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          {generatingReport ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">IA analisando recomendações de carreira...</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CareerRecommendationsSection;