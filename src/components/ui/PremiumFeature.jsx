// src/components/ui/PremiumFeature.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from './button';
import UpgradeModal from './UpgradeModal';

/**
 * Componente para controlar acesso a features premium
 *
 * @param {Object} props
 * @param {string} props.feature - Nome da feature (deve estar em FREE_FEATURES ou PREMIUM_FEATURES)
 * @param {React.ReactNode} props.children - Conteúdo a ser renderizado se tiver acesso
 * @param {React.ReactNode} props.fallback - Conteúdo alternativo para usuários sem acesso (opcional)
 * @param {boolean} props.showUpgradePrompt - Se deve mostrar prompt de upgrade (padrão: true)
 * @param {string} props.upgradeMessage - Mensagem customizada para o upgrade
 * @param {string} props.mode - 'block' (bloqueia totalmente) ou 'blur' (mostra borrado) (padrão: 'block')
 */
const PremiumFeature = ({
  feature,
  children,
  fallback = null,
  showUpgradePrompt = true,
  upgradeMessage = 'Assine para ter acesso completo a esta funcionalidade',
  mode = 'block'
}) => {
  const { canAccessFeatureAsync, FREE_FEATURES } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(null); // null = carregando
  const [isChecking, setIsChecking] = useState(true);

  // Verificar acesso via API
  useEffect(() => {
    const checkAccess = async () => {
      console.log('🔐 PremiumFeature - Verificando acesso para feature:', feature);

      // Features gratuitas têm acesso imediato
      if (Object.values(FREE_FEATURES).includes(feature)) {
        console.log('✅ PremiumFeature - Feature gratuita, acesso liberado');
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      try {
        const access = await canAccessFeatureAsync(feature);
        console.log('✅ PremiumFeature - Resultado da verificação:', access);
        setHasAccess(access);
      } catch (error) {
        console.error('❌ PremiumFeature - Erro ao verificar acesso:', error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [feature, canAccessFeatureAsync, FREE_FEATURES]);

  // Enquanto está verificando, mostra loading
  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Se tem acesso, renderiza normalmente
  if (hasAccess) {
    return <>{children}</>;
  }

  // Se não tem acesso e tem fallback customizado
  if (fallback) {
    return <>{fallback}</>;
  }

  // Se não deve mostrar prompt de upgrade, retorna null
  if (!showUpgradePrompt) {
    return null;
  }

  // Renderiza bloqueio com opção de upgrade
  if (mode === 'blur') {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white backdrop-blur-sm">
          <div className="text-center p-6 max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Conteúdo Premium</h3>
            <p className="text-gray-300 mb-4">{upgradeMessage}</p>
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Fazer Upgrade
            </Button>
          </div>
        </div>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={feature}
        />
      </div>
    );
  }

  // Mode 'block' - Mostra card de bloqueio
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full border rounded-lg p-8 text-center bg-gradient-to-br bg-white">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">Conteúdo Premium</h3>
        <p className="text-black mb-6">{upgradeMessage}</p>
        <Button
          onClick={() => setShowUpgradeModal(true)}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Fazer Upgrade para Premium
        </Button>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature={feature}
        />
      </div>
    </div>
  );
};

/**
 * Componente menor para badge premium
 */
export const PremiumBadge = ({ className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-xs font-semibold text-white ${className}`}>
      <Crown className="w-3 h-3" />
      Premium
    </span>
  );
};

/**
 * Componente para botões de features premium
 */
export const PremiumButton = ({
  feature,
  onClick,
  children,
  className = '',
  ...props
}) => {
  const { canAccessFeatureAsync, FREE_FEATURES } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (Object.values(FREE_FEATURES).includes(feature)) {
        setHasAccess(true);
        return;
      }
      const access = await canAccessFeatureAsync(feature);
      setHasAccess(access);
    };
    checkAccess();
  }, [feature, canAccessFeatureAsync, FREE_FEATURES]);

  const handleClick = (e) => {
    if (!hasAccess) {
      e.preventDefault();
      setShowUpgradeModal(true);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className={`relative ${className}`}
        {...props}
      >
        {children}
        {!hasAccess && (
          <Lock className="w-4 h-4 ml-2" />
        )}
      </Button>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={feature}
      />
    </>
  );
};

export default PremiumFeature;
