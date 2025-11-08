import { Sparkles, FileText } from "lucide-react";

const ActionButtons = ({ aiReport, generatingReport, onGenerateReport, onNewTest }) => {
  return (
    <div className="flex justify-center space-x-4">
      {(!aiReport && !generatingReport) && (
        <button
          onClick={onGenerateReport}
          disabled={generatingReport}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Gerar Análise Completa com IA</span>
        </button>
      )}
      
      {aiReport && !generatingReport && (
        <button
          onClick={onGenerateReport}
          disabled={generatingReport}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Regenerar Análise IA</span>
        </button>
      )}
      
      <button
        onClick={onNewTest}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
      >
        <FileText className="w-4 h-4" />
        <span>Fazer Novo Teste</span>
      </button>
    </div>
  );
};

export default ActionButtons;