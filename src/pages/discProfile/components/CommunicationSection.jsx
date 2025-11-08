import { Sparkles } from "lucide-react";

const CommunicationSection = ({ communicationStyle, aiReport, generatingReport }) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white bg-gray-800 px-3 py-2">ESTILO DE COMUNICAÇÃO</h3>
        {aiReport?.isAIGenerated && (
          <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
            <Sparkles className="w-3 h-3" />
            <span>Gerado por IA</span>
          </div>
        )}
      </div>
      {communicationStyle.howYouCommunicate.length > 0 ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Como você se comunica:</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {communicationStyle.howYouCommunicate.map((item, index) => (
                <div key={index} className="border-l-3 border-blue-400 pl-3">
                  <h5 className="text-xs font-semibold text-gray-900 mb-1">{item.style}</h5>
                  <p className="text-xs text-gray-700">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Como outros devem se comunicar com você:</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              {communicationStyle.howOthersShouldCommunicate.map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          {generatingReport ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">IA analisando seu estilo de comunicação...</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CommunicationSection;