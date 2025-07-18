import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const WelcomeAnimation = ({ userName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [timeUntilClass, setTimeUntilClass] = useState('');
  const [showGift, setShowGift] = useState(false);

  // Calcular tempo até 17h
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const today17h = new Date();
      today17h.setHours(17, 0, 0, 0);
      
      // Se já passou das 17h hoje, calcular para amanhã
      if (now > today17h) {
        today17h.setDate(today17h.getDate() + 1);
      }
      
      const diff = today17h - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilClass(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 1000);
    const timer2 = setTimeout(() => setCurrentStep(2), 2500);
    const timer3 = setTimeout(() => setCurrentStep(3), 4000);
    const timer4 = setTimeout(() => setCurrentStep(4), 5500);
    const timer5 = setTimeout(() => setShowGift(true), 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  const handleOkClick = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      >
        <div className="text-center max-w-2xl mx-auto px-8">
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: currentStep >= 0 ? 1 : 0,
              rotate: currentStep >= 0 ? 0 : -180
            }}
            transition={{ 
              duration: 1.2,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="mb-8"
          >
            <img 
              src="/3.png" 
              alt="AgroSkills" 
              className="w-32 h-32 mx-auto drop-shadow-lg"
            />
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ 
              y: currentStep >= 1 ? 0 : 50,
              opacity: currentStep >= 1 ? 1 : 0
            }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Bem-vindo, {userName}!
            </h1>
            <p className="text-xl text-green-400">
              à Melhor Aceleradora de Carreiras
            </p>
          </motion.div>

          {/* Community Description */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ 
              y: currentStep >= 2 ? 0 : 30,
              opacity: currentStep >= 2 ? 1 : 0
            }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-500/30">
              <h2 className="text-2xl font-semibold text-green-400 mb-3">
                🌱 A Maior Comunidade de Desenvolvimento
              </h2>
              <p className="text-lg text-green-300 leading-relaxed">
                de Pessoas para o <span className="font-bold text-green-400">Agronegócio</span>
              </p>
            </div>
          </motion.div>

          {/* Timer para Aula ao Vivo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: currentStep >= 3 ? 1 : 0.8,
              opacity: currentStep >= 3 ? 1 : 0
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-red-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-500/30">
              <h3 className="text-xl font-semibold text-red-400 mb-2">
                🔴 Próxima Aula ao Vivo
              </h3>
              <p className="text-red-300 mb-3">Hoje às 17:00</p>
              <div className="text-3xl font-mono font-bold text-red-400">
                {timeUntilClass}
              </div>
              <p className="text-red-300 text-sm mt-2">Tempo restante</p>
            </div>
          </motion.div>

          {/* Features Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: currentStep >= 3 ? 1 : 0.8,
              opacity: currentStep >= 3 ? 1 : 0
            }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:!grid-cols-3 gap-4 mb-8"
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ 
                x: currentStep >= 3 ? 0 : -50,
                opacity: currentStep >= 3 ? 1 : 0
              }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gray-800/80 rounded-xl p-4 text-center border border-gray-600"
            >
              <div className="text-2xl mb-2">🚜</div>
              <p className="text-green-400 font-medium">Tecnologia Agrícola</p>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ 
                y: currentStep >= 3 ? 0 : 50,
                opacity: currentStep >= 3 ? 1 : 0
              }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-gray-800/80 rounded-xl p-4 text-center border border-gray-600"
            >
              <div className="text-2xl mb-2">📈</div>
              <p className="text-green-400 font-medium">Gestão Rural</p>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ 
                x: currentStep >= 3 ? 0 : 50,
                opacity: currentStep >= 3 ? 1 : 0
              }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-gray-800/80 rounded-xl p-4 text-center border border-gray-600"
            >
              <div className="text-2xl mb-2">🌾</div>
              <p className="text-green-400 font-medium">Sustentabilidade</p>
            </motion.div>
          </motion.div>

          {/* Gift Animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: showGift ? 1 : 0,
              opacity: showGift ? 1 : 0
            }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 150,
              damping: 12
            }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-yellow-600/90 to-orange-600/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 border-yellow-400/50 relative overflow-hidden">
              {/* Sparkle effects */}
              <div className="absolute inset-0">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: Math.random() * 300 - 150,
                      y: Math.random() * 200 - 100
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 2,
                      repeat: Infinity,
                      repeatDelay: Math.random() * 3
                    }}
                    className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%'
                    }}
                  />
                ))}
              </div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ 
                  y: showGift ? 0 : 20,
                  opacity: showGift ? 1 : 0
                }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative z-10"
              >
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Parabéns! Você ganhou um presente!
                </h3>
                <p className="text-yellow-100 text-lg mb-4 leading-relaxed">
                  Acesso <span className="font-bold text-yellow-300">GRATUITO</span> a uma trilha completa<br/>
                  e todos os aplicativos da plataforma!
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-yellow-100">
                    🚀 Trilhas de Carreira
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-yellow-100">
                    📱 Aplicativos Premium
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-yellow-100">
                    🎯 Conteúdo Exclusivo
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Botão OK */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: showGift ? 1 : 0,
              y: showGift ? 0 : 20
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              onClick={handleOkClick}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg"
            >
              OK, Vamos Começar!
            </Button>
          </motion.div>
        </div>

        {/* Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                y: (typeof window !== 'undefined' ? window.innerHeight : 1080) + 50,
                opacity: 0
              }}
              animate={{ 
                y: -50,
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                delay: Math.random() * 3,
                repeat: Infinity,
                repeatDelay: Math.random() * 4
              }}
              className="absolute w-1 h-1 bg-green-400 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeAnimation;

