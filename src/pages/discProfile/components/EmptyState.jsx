import { User, FileText } from "lucide-react";

const EmptyState = ({ tests, onNewTest }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
      <User className="w-16 h-16 text-gray-400 mx-auto mb-6" />
      <h3 className="text-xl font-bold text-gray-900 mb-4">Visualizar Perfil DISC</h3>
      <p className="text-gray-600 mb-6">
        Escolha uma data de teste acima para visualizar seu perfil DISC ou faça um novo teste.
      </p>
      
      {tests.length === 0 && (
        <div className="mt-6">
          <button
            onClick={onNewTest}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <FileText className="w-4 h-4" />
            <span>Fazer Teste DISC</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;