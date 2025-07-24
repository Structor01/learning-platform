import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Users, 
  TrendingUp, 
  X, 
  ArrowRight,
  Briefcase,
  BookOpen,
  Star,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DISCIncentiveModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    onClose();
    navigate('/teste-disc');
  };

  const benefits = [
    {
      icon: Briefcase,
      title: "Vagas Personalizadas",
      description: "Receba oportunidades de trabalho que combinam com seu perfil comportamental"
    },
    {
      icon: BookOpen,
      title: "Conteúdos Direcionados",
      description: "Acesse cursos e materiais específicos para seu tipo de personalidade"
    },
    {
      icon: Users,
      title: "Networking Inteligente",
      description: "Conecte-se com profissionais que complementam suas características"
    },
    {
      icon: TrendingUp,
      title: "Desenvolvimento Focado",
      description: "Planos de carreira baseados em seus pontos fortes e áreas de melhoria"
    }
  ];

  const profiles = [
    {
      type: "D",
      name: "Dominância",
      color: "from-red-500 to-red-600",
      icon: Target,
      description: "Liderança e resultados"
    },
    {
      type: "I", 
      name: "Influência",
      color: "from-yellow-500 to-yellow-600",
      icon: Star,
      description: "Comunicação e persuasão"
    },
    {
      type: "S",
      name: "Estabilidade", 
      color: "from-green-500 to-green-600",
      icon: Users,
      description: "Colaboração e harmonia"
    },
    {
      type: "C",
      name: "Conformidade",
      color: "from-blue-500 to-blue-600", 
      icon: Brain,
      description: "Análise e precisão"
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-gray-800">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Descubra Seu Perfil Comportamental
              </h2>
              <p className="text-gray-400 text-lg">
                Complete o Teste DISC e desbloqueie todo o potencial da plataforma AgroSkills
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Benefits Grid */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                O que você ganha ao completar o teste:
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{benefit.title}</h4>
                        <p className="text-gray-400 text-sm">{benefit.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* DISC Profiles Preview */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                Conheça os 4 Perfis DISC:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profiles.map((profile, index) => (
                  <motion.div
                    key={profile.type}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${profile.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                      <profile.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{profile.type}</div>
                    <div className="text-sm font-medium text-gray-300 mb-1">{profile.name}</div>
                    <div className="text-xs text-gray-400">{profile.description}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Test Info */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
              <div className="flex items-center justify-center space-x-8 text-center">
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-purple-400 mr-2" />
                    <span className="text-white font-semibold">8 minutos</span>
                  </div>
                  <p className="text-gray-400 text-sm">Duração média</p>
                </div>
                <div className="w-px h-12 bg-gray-700"></div>
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <Brain className="h-5 w-5 text-purple-400 mr-2" />
                    <span className="text-white font-semibold">12 perguntas</span>
                  </div>
                  <p className="text-gray-400 text-sm">Rápido e preciso</p>
                </div>
                <div className="w-px h-12 bg-gray-700"></div>
                <div>
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-5 w-5 text-purple-400 mr-2" />
                    <span className="text-white font-semibold">Gratuito</span>
                  </div>
                  <p className="text-gray-400 text-sm">Sem custo algum</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartTest}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center group"
              >
                <Brain className="h-5 w-5 mr-2" />
                Fazer Teste DISC Agora
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
              >
                Talvez Depois
              </button>
            </div>

            {/* Footer Note */}
            <p className="text-center text-gray-500 text-sm mt-4">
              Você pode fazer o teste a qualquer momento acessando "Meus Testes" no menu
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DISCIncentiveModal;

