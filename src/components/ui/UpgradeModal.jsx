// src/components/ui/UpgradeModal.jsx
import React from 'react';
import { X, Crown, Check, Sparkles, Zap, TrendingUp } from 'lucide-react';
import { Button } from './button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const UpgradeModal = ({ isOpen, onClose, feature }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

//Exemplo de usuário

// {
//     "id": 1917,
//     "email": "artfbgyn@gmail.com",
//     "phone": null,
//     "name": "Arthur Barros",
//     "userType": "candidate",
//     "role": "admin",
//     "linkedin": "https://www.linkedin.com/in/arthur-barros-a8251baa/",
//     "experience_level": null,
//     "education_level": null,
//     "preferred_job_type": null,
//     "skills": null,
//     "current_position": null,
//     "bio": null,
//     "companyId": null,
//     "company": null,
//     "collected_data": null,
//     "createdAt": null,
//     "updatedAt": "2025-09-26T11:52:31.000Z"
// }





  const handleUpgrade = () => {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = 'https://tc.intermediador.yapay.com.br/payment/transaction';

    const tokenAccount = createHiddenInput('token_account', 'f3665ddb23ccb04');
    form.appendChild(tokenAccount);

    form.appendChild(createHiddenInput('url_notification', 'http://190.115.85.73:3001/api/api/subscriptions/vindi'));
    form.appendChild(createHiddenInput('url_success', 'http://190.115.85.73:3001/api/api/subscriptions/vindi'));

    form.appendChild(createHiddenInput('transaction_product[][description]', `Plano Premium - Usuário ${user.id}`));
    form.appendChild(createHiddenInput('transaction_product[][quantity]', '1'));
    form.appendChild(createHiddenInput('transaction_product[][price_unit]', '18.90'));
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

  // Função auxiliar para criar inputs hidden
  const createHiddenInput = (name, value) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    return input;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl shadow-2xl animate-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-8 text-center border-b border-gray-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Desbloqueie Todo o Potencial
          </h2>
          <p className="text-gray-400">
            Tenha acesso ilimitado a todas as funcionalidades premium do AgroSkills
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Pricing */}
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl font-bold text-white">R$ 18,90</span>
              <span className="text-gray-400">/mês</span>
            </div>
            <p className="text-center text-sm text-gray-400">
              Cancele quando quiser • Sem contratos
            </p>
          </div>

          {/* Benefits list */}
          <div className="space-y-3 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              O que está incluso:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-gray-300 text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-6 text-lg shadow-lg shadow-orange-500/20"
            >
              <Zap className="w-5 h-5 mr-2" />
              Começar Agora
            </Button>
            <button
              onClick={onClose}
              className="w-full text-gray-400 hover:text-white transition-colors text-sm"
            >
              Continuar com plano gratuito
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Pagamento seguro
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Garantia de 7 dias
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
