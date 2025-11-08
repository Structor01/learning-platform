import { ArrowLeft } from "lucide-react";

const Header = ({ onBack }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-all duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="hidden sm:inline font-medium">Voltar ao Dashboard</span>
            <span className="sm:hidden font-medium">Voltar</span>
          </button>

          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Perfil DISC
            </h1>
          </div>

          <div className="w-20 sm:w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default Header;