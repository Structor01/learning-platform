import { Sparkles } from "lucide-react";

const LoadingIndicator = () => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-center space-x-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <Sparkles className="w-5 h-5 text-purple-600" />
        <span className="text-purple-800 font-medium">IA analisando seu perfil e gerando relatório personalizado...</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;