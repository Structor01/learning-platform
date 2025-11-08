import { Sparkles } from "lucide-react";

const WorkEnvironmentSection = ({ workEnvironment, aiReport, generatingReport }) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white bg-gray-800 px-3 py-2">AMBIENTE DE TRABALHO IDEAL</h3>
        {aiReport?.isAIGenerated && (
          <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Gerado por IA</span>
          </div>
        )}
      </div>
      {workEnvironment.ideal.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Condições Ideais:</h4>
            <div className="space-y-2">
              {workEnvironment.ideal.map((condition, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs text-gray-700">{condition}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Evitar:</h4>
            <div className="space-y-2">
              {workEnvironment.avoid.map((condition, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs text-gray-700">{condition}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          {generatingReport ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">IA analisando ambiente de trabalho ideal...</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default WorkEnvironmentSection;