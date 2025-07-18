import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

const TrilhaRequirementModal = ({ isOpen, onClose, trilhaName }) => {
  if (!isOpen) return null;

  const handleGoToGestaoCarreira = () => {
    // Navegar para a trilha Gestão de Carreira
    window.location.href = '/trilha';
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Trilha Bloqueada</h2>
                  <p className="text-sm text-gray-400">Pré-requisito necessário</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                {trilhaName ? `${trilhaName}` : 'Esta Trilha'} está bloqueada
              </h3>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Para acessar esta trilha, você precisa primeiro finalizar a trilha 
                <span className="font-semibold text-orange-400"> Gestão de Carreira</span>.
              </p>

              {/* Requirement */}
              <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Gestão de Carreira</p>
                    <p className="text-orange-300 text-sm">6 módulos • Estratégias avançadas</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 border-2 border-orange-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits of completing first */}
              <div className="text-left space-y-3 mb-6">
                <p className="text-sm font-medium text-gray-300 mb-2">
                  Ao completar Gestão de Carreira, você terá:
                </p>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Base sólida para outras trilhas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Conhecimento fundamental do agronegócio</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Estratégias de crescimento profissional</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleGoToGestaoCarreira}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Ir para Gestão de Carreira
              </Button>
              
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full text-gray-400 hover:text-white"
              >
                Entendi, voltar depois
              </Button>
            </div>

            {/* Footer */}
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
              <p className="text-xs text-blue-300 text-center">
                💡 <strong>Dica:</strong> Complete as trilhas em ordem para maximizar seu aprendizado!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TrilhaRequirementModal;

