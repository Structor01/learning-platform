import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Zap, Star, CheckCircle, CreditCard } from 'lucide-react';

const AppAccessModal = ({ isOpen, onClose, appName }) => {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // Aqui você pode adicionar lógica para processar o pagamento
    ('Iniciando processo de upgrade...');
    // Por enquanto, apenas fecha o modal
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
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Acesso Premium</h2>
                  <p className="text-sm text-gray-400">Desbloqueie todos os recursos</p>
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
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                {appName ? `Acesse ${appName}` : 'Acesse os Aplicativos'}
              </h3>

              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Para acessar todos os aplicativos da biblioteca, você precisa iniciar o
                <span className="font-semibold text-green-400"> Programa de Aceleração de Carreira</span>.
              </p>

              {/* Price */}
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Por apenas</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-3xl font-bold text-green-400">R$ 29,90</span>
                    <span className="text-gray-400">/mês</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cancele quando quiser</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="text-left space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Acesso a todos os aplicativos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Trilhas de carreira personalizadas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Mentoria especializada</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Certificados reconhecidos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300">Suporte prioritário</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Iniciar Programa - R$ 29,90/mês
              </Button>

              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full text-gray-400 hover:text-white"
              >
                Talvez mais tarde
              </Button>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Pagamento seguro • Cancele quando quiser • Sem taxas ocultas
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AppAccessModal;

