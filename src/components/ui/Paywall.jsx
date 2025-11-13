import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, Users, Award, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Paywall = ({ contentTitle, contentType = 'curso', onClose }) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('professional');

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 29.90,
      period: 'mês',
      description: 'Perfeito para começar sua jornada',
      icon: <Star className="w-5 h-5" />,
      color: 'bg-blue-500',
      features: [
        'Acesso completo ao catálogo de cursos',
        'Certificações básicas',
        'Suporte por email',
        'Dashboard personalizado DISC',
        'Progresso detalhado'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Profissional',
      price: 59.90,
      period: 'mês',
      description: 'Ideal para profissionais em crescimento',
      icon: <Crown className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      features: [
        'Tudo do plano Básico',
        'Módulo "Tenho Vagas"',
        'Simulador de Entrevistas',
        'Certificações premium',
        'Suporte prioritário',
        'Networking inteligente',
        'Mentoria personalizada'
      ],
      popular: true
    },
    {
      id: 'corporate',
      name: 'Corporativo',
      price: 149.90,
      period: 'mês',
      description: 'Para empresas e equipes',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-green-500 to-teal-500',
      features: [
        'Tudo do plano Profissional',
        'Múltiplas licenças (até 10)',
        'Dashboard de gestão de equipes',
        'Relatórios avançados',
        'Consultoria especializada',
        'API de integração',
        'Suporte dedicado'
      ],
      popular: false
    }
  ];

  const getDiscColor = () => {
    const profile = user?.discProfile?.predominant;
    switch (profile) {
      case 'dominante': return 'text-red-500';
      case 'influente': return 'text-green-500';
      case 'estavel': return 'text-blue-500';
      case 'conforme': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getPersonalizedMessage = () => {
    const profile = user?.discProfile?.predominant;
    switch (profile) {
      case 'dominante':
        return 'Acelere seus resultados e conquiste vantagem competitiva no mercado.';
      case 'influente':
        return 'Conecte-se com uma comunidade de profissionais e expanda sua rede.';
      case 'estavel':
        return 'Desenvolva-se de forma consistente com suporte completo e segurança.';
      case 'conforme':
        return 'Acesse conteúdo técnico de alta qualidade com certificações reconhecidas.';
      default:
        return 'Desbloqueie todo o potencial da plataforma de aprendizado.';
    }
  };

  const handleSubscribe = (planId) => {
    // Aqui seria integrado com o Stripe
    ('Iniciando assinatura do plano:', planId);
    // Por enquanto, simular ativação da assinatura
    setTimeout(() => {
      alert('Assinatura ativada com sucesso! (Simulação)');
      onClose?.();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-8 bg-gradient-to-r from-gray-900 to-black text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Conteúdo Premium</span>
            </div>

            <h1 className="text-3xl font-bold mb-2">
              Desbloqueie "{contentTitle}"
            </h1>

            <p className={`text-lg ${getDiscColor()} font-medium mb-2`}>
              Personalizado para perfil {user?.discProfile?.predominant || 'DISC'}
            </p>

            <p className="text-white/80 max-w-2xl mx-auto">
              {getPersonalizedMessage()}
            </p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="p-8 bg-gray-50 border-b">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {contentTitle}
              </h3>
              <p className="text-gray-600">
                {contentType === 'curso' ? 'Curso completo' : 'Conteúdo premium'} • 45 min
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Acesso Completo</p>
                <p className="text-sm text-gray-600">Sem limitações de tempo</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
              <Award className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">Certificação</p>
                <p className="text-sm text-gray-600">Reconhecida pelo mercado</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
              <Shield className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium text-gray-900">Suporte</p>
                <p className="text-sm text-gray-600">Mentoria especializada</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Section */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Escolha seu plano
            </h2>
            <p className="text-gray-600">
              Comece hoje e transforme sua carreira
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl ${selectedPlan === plan.id
                    ? 'ring-2 ring-purple-500 shadow-lg'
                    : 'hover:shadow-lg'
                  } ${plan.popular ? 'border-purple-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 ${plan.color} rounded-xl flex items-center justify-center text-white mx-auto mb-4`}>
                    {plan.icon}
                  </div>

                  <CardTitle className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>

                  <p className="text-gray-600 text-sm">
                    {plan.description}
                  </p>

                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full ${plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : 'bg-gray-900 hover:bg-gray-800'
                      } text-white`}
                  >
                    {selectedPlan === plan.id ? 'Assinar Agora' : 'Selecionar'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Guarantee */}
          <div className="mt-8 text-center p-6 bg-green-50 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">
                Garantia de 7 dias
              </span>
            </div>
            <p className="text-green-700 text-sm">
              Não ficou satisfeito? Devolvemos 100% do seu dinheiro, sem perguntas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paywall;

