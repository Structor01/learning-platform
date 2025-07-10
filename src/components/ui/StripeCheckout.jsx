import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Shield, 
  Check, 
  ArrowLeft,
  Crown,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Chave pública do Stripe (em produção, usar variável de ambiente)
const stripePromise = loadStripe('pk_test_51234567890abcdef...');

const CheckoutForm = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, updateSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    document: ''
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    // Simular processamento do pagamento
    try {
      // Em produção, aqui seria feita a chamada para o backend
      // que criaria o PaymentIntent no Stripe
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso do pagamento
      const paymentResult = {
        paymentIntent: {
          status: 'succeeded',
          id: 'pi_' + Math.random().toString(36).substr(2, 9)
        }
      };

      if (paymentResult.paymentIntent.status === 'succeeded') {
        // Atualizar status da assinatura
        updateSubscription({
          status: 'active',
          plan: plan.id,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          cancelAtPeriodEnd: false
        });

        onSuccess?.(paymentResult);
      } else {
        setError('Falha no processamento do pagamento. Tente novamente.');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('Erro no pagamento:', err);
    }

    setIsLoading(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Summary */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Plano {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cobrança mensal • Cancele quando quiser
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  R$ {plan.price.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-sm text-gray-600">/mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Informações de Cobrança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="document">CPF/CNPJ</Label>
                <Input
                  id="document"
                  value={customerInfo.document}
                  onChange={(e) => setCustomerInfo(prev => ({
                    ...prev,
                    document: e.target.value
                  }))}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Informações de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Cartão de Crédito</Label>
                <div className="mt-2 p-3 border rounded-lg bg-white">
                  <CardElement options={cardElementOptions} />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Security Features */}
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">
                    Pagamento 100% Seguro
                  </p>
                  <p className="text-green-600">
                    Seus dados são protegidos com criptografia SSL
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Plano {plan.name}</span>
                <span>R$ {plan.price.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Impostos</span>
                <span>Inclusos</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>R$ {plan.price.toFixed(2).replace('.', ',')}/mês</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button
            type="submit"
            disabled={!stripe || isLoading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Confirmar Assinatura
              </>
            )}
          </Button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center">
          Ao confirmar, você concorda com nossos{' '}
          <a href="#" className="text-purple-600 hover:underline">
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href="#" className="text-purple-600 hover:underline">
            Política de Privacidade
          </a>
        </p>
      </form>
    </div>
  );
};

const StripeCheckout = ({ plan, onSuccess, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Finalizar Assinatura
            </h1>
            <p className="text-gray-600">
              Complete seu pagamento e comece a aprender agora
            </p>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm
              plan={plan}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;

