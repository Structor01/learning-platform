// src/components/ui/UpgradeModal.jsx
import React, { useState } from 'react';
import { X, Crown, Check, Sparkles, Zap } from 'lucide-react';
import { Button } from './button';
import { useAuth } from '@/contexts/AuthContext';

const UpgradeModal = ({ isOpen, onClose, feature }) => {
  const { user } = useAuth();
  const [selectedPaymentOption, setSelectedPaymentOption] = useState('monthly');

  if (!isOpen) return null;

  const paymentOptions = {
    monthly: {
      id: 'monthly',
      label: 'Pagamento Mensal',
      price: '18,90',
      period: '/mês',
      description: 'Assine e cancele quando quiser',
      link: 'https://pagar.vindi.com.br/23a2a1448002368061c6beff8a4834a3cbb83dff',
      highlighted: false,
    },
    fullPayment: {
      id: 'fullPayment',
      label: 'Pagamento Único (Anual)',
      price: '189,00',
      period: 'por ano',
      description: 'Economize 11% com pagamento anual',
      link: 'https://pagar.vindi.com.br/1592b497b70963bbf57f46141ab1279f124ae313',
      highlighted: true,
    },
  };


  const handleUpgrade = () => {
    // Redirecionar para o link de pagamento Vindi selecionado
    const selectedOption = paymentOptions[selectedPaymentOption];
    window.location.href = selectedOption.link;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-full hover:bg-green-50 transition-colors text-gray-400 hover:text-green-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-2 sm:p-4 md:p-6 text-center bg-gradient-to-br from-green-50 to-white sticky top-0">
          <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-2 sm:mb-3">
            <Crown className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1 leading-tight">
            Desbloqueie o Potencial
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-tight">
            Acesso ilimitado a todas as funcionalidades
          </p>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-4 md:p-6 max-h-[calc(90vh-150px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Payment Options */}
          <div className="mb-4 sm:mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
              {Object.entries(paymentOptions).map(([key, option]) => (
                <div
                  key={key}
                  onClick={() => setSelectedPaymentOption(key)}
                  className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-300 ${selectedPaymentOption === key
                    ? 'bg-gradient-to-br from-green-50 to-green-100 ring-2 ring-green-400'
                    : 'bg-white'
                    } ${option.highlighted ? 'ring-2 ring-green-400/50 shadow-md' : 'shadow-sm'}`}
                >
                  {option.highlighted && (
                    <div className="inline-block px-2 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-semibold mb-2">
                      Mais Popular
                    </div>
                  )}
                  <h4 className="text-gray-900 font-semibold text-sm sm:text-base mb-2">{option.label}</h4>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl sm:text-3xl font-bold text-black">R$ {option.price}</span>
                    <span className="text-xs text-gray-600">{option.period}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{option.description}</p>
                  {selectedPaymentOption === key && (
                    <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                      <Check className="w-4 h-4" />
                      Selecionado
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>



          {/* CTA Buttons */}
          <div className="space-y-1 sm:space-y-2">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-green-500 to-green-600  hover:to-green-700 text-white font-bold py-2.5 sm:py-4 text-xs sm:text-sm shadow-lg shadow-green-500/20 transition-all active:scale-95"
            >
              <Zap className="w-3 sm:w-4 h-3 sm:h-4 mr-1.5" />
              Começar Agora
            </Button>
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-900 transition-colors text-xs py-1"
            >
              Continuar grátis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
