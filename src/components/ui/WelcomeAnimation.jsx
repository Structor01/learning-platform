import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeAnimation = ({ userName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 1000);
    const timer2 = setTimeout(() => setCurrentStep(2), 2500);
    const timer3 = setTimeout(() => setCurrentStep(3), 4000);
    const timer4 = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-green-100 z-50 flex items-center justify-center"
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
              src="/agroskills-logo.png" 
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
            <h1 className="text-4xl font-bold text-green-800 mb-2">
              Bem-vindo, {userName}!
            </h1>
            <p className="text-xl text-green-600">
              à AgroSkills
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-200">
              <h2 className="text-2xl font-semibold text-green-700 mb-3">
                🌱 A Maior Comunidade de Desenvolvimento
              </h2>
              <p className="text-lg text-green-600 leading-relaxed">
                de Pessoas para o <span className="font-bold text-green-800">Agronegócio</span>
              </p>
            </div>
          </motion.div>

          {/* Features Animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: currentStep >= 3 ? 1 : 0.8,
              opacity: currentStep >= 3 ? 1 : 0
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ 
                x: currentStep >= 3 ? 0 : -50,
                opacity: currentStep >= 3 ? 1 : 0
              }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-green-100 rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-2">🚜</div>
              <p className="text-green-700 font-medium">Tecnologia Agrícola</p>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ 
                y: currentStep >= 3 ? 0 : 50,
                opacity: currentStep >= 3 ? 1 : 0
              }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-green-100 rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-2">📈</div>
              <p className="text-green-700 font-medium">Gestão Rural</p>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ 
                x: currentStep >= 3 ? 0 : 50,
                opacity: currentStep >= 3 ? 1 : 0
              }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-green-100 rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-2">🌾</div>
              <p className="text-green-700 font-medium">Sustentabilidade</p>
            </motion.div>
          </motion.div>

          {/* Loading Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: currentStep >= 3 ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-8"
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-green-600 mt-2 text-sm">Preparando sua experiência...</p>
          </motion.div>
        </div>

        {/* Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
                opacity: 0
              }}
              animate={{ 
                y: -50,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 3
              }}
              className="absolute w-2 h-2 bg-green-300 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeAnimation;

