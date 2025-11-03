// src/components/ui/UpgradeModal.jsx
import React, { useState } from 'react';
import { X, Crown, Check, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { Button } from './button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const UpgradeModal = ({ isOpen, onClose, feature }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  if (!isOpen) return null;

  const benefits = [
    'Acesso a todas as trilhas de aprendizado',
    'Certificados profissionais',
    'Entrevistas simuladas ilimitadas',
    'Relatórios completos de perfil DISC',
    'Vídeo Pitch profissional',
    'Agenda de eventos exclusivos',
    'Conteúdo atualizado semanalmente',
    'Suporte prioritário',
  ];

  const handleUpgrade = () => {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = 'https://tc.intermediador.yapay.com.br/payment/transaction';

    const tokenAccount = createHiddenInput('token_account', 'f3665ddb23ccb04');
    form.appendChild(tokenAccount);

    form.appendChild(createHiddenInput('url_notification', 'https://learning-platform-backend-2x39.onrender.com/api/api/subscriptions/vindi'));
    form.appendChild(createHiddenInput('url_success', 'https://gskills.web.app/dashboard?message=subscription_success'));

    form.appendChild(createHiddenInput('transaction_product[][description]', `Plano Premium - Usuário ${user.id}`));

    // Adicionar dados baseado no plano selecionado
    if (selectedPlan === 'monthly') {
      form.appendChild(createHiddenInput('transaction_product[][quantity]', '12'));
      form.appendChild(createHiddenInput('transaction_product[][price_unit]', '18.90'));
    } else {
      form.appendChild(createHiddenInput('transaction_product[][quantity]', '1'));
      form.appendChild(createHiddenInput('transaction_product[][price_unit]', '197.00'));
    }

    form.appendChild(createHiddenInput('transaction_product[][extra]', `${user.id}`));
    form.appendChild(createHiddenInput('transaction_product[][code]', `PROD-${user.id}`));


    if (user) {
      form.appendChild(createHiddenInput('customer[name]', user.name));
      form.appendChild(createHiddenInput('customer[email]', user.email));

      // Contato do cliente (se disponível)
      if (user.phone) {
        form.appendChild(createHiddenInput('customer[contacts][][type_contact]', 'H'));
        form.appendChild(createHiddenInput('customer[contacts][][number_contact]', user.phone));
      }
    }


    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    onClose();
  };

  const handlePlanSelection = () => {
    handleUpgrade();
  };

  // Função auxiliar para criar inputs hidden
  const createHiddenInput = (name, value) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    return input;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto sm:overflow-visible">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-2xl animate-in zoom-in duration-300 my-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-4 sm:p-5 text-center border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
          <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-white mb-2">
            <Crown className="w-6 sm:w-7 h-6 sm:h-7 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">
            Plano Premium
          </h2>
          <p className="text-xs text-green-100">
            Desbloqueie todas as funcionalidades
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {/* Pricing Cards */}
          <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {/* Card Mensal */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${selectedPlan === 'monthly'
                ? 'bg-green-50 border-green-500'
                : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-left min-w-0">
                  <p className={`text-xs mb-1 ${selectedPlan === 'monthly' ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>Mensal</p>
                  <p className="text-lg sm:text-2xl font-bold text-black"><span className="text-base sm:text-lg">R$</span> 18,90<span className="text-xs text-gray-600">/mês</span></p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedPlan === 'monthly'
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-400'
                  }`}>
                  {selectedPlan === 'monthly' && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            </button>

            {/* Card Anual */}
            <button
              onClick={() => setSelectedPlan('annual')}
              className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${selectedPlan === 'annual'
                ? 'bg-green-50 border-green-500'
                : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-left min-w-0">
                  <p className={`text-xs mb-1 ${selectedPlan === 'annual' ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>Anual</p>
                  <p className="text-lg sm:text-2xl font-bold text-black"><span className="text-base sm:text-lg">R$</span> 197,00<span className="text-xs text-gray-600">/ano</span></p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedPlan === 'annual'
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-400'
                  }`}>
                  {selectedPlan === 'annual' && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            </button>
          </div>

          {/* Benefits list */}
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4 flex items-center gap-2">
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
              O que está incluso:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-xs sm:text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2 mt-4 sm:mt-6">
            <Button
              onClick={handlePlanSelection}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 sm:py-3 text-xs sm:text-sm shadow-lg shadow-green-600/20"
            >
              <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1.5 sm:mr-2" />
              Começar com {selectedPlan === 'monthly' ? 'Mensal' : 'Anual'}
            </Button>
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-900 transition-colors text-xs sm:text-xs py-2"
            >
              Continuar com plano gratuito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
