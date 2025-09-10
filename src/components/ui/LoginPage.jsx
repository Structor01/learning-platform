// src/components/ui/LoginPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import DISCIncentiveModal from "./DISCIncentiveModal";
import testService from "@/services/testService";

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDISCModal, setShowDISCModal] = useState(false);

  // Novos estados para controlar o fluxo
  const [step, setStep] = useState("email"); // "email", "password" ou "signup"
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setEmail(email);
      setStep("password");
    }
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("🔍 LoginPage useEffect disparado - user:", !!user, "accessToken:", !!accessToken, "step:", step);
    // Só navegar automaticamente se não estiver mostrando o modal DISC
    if (user && accessToken && !showDISCModal) {
      console.log("🔍 LoginPage useEffect - navegando para /dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate, step, showDISCModal]);

  // Função para verificar se o email existe no banco
  const checkEmailExists = async (emailToCheck) => {
    if (!emailToCheck || typeof emailToCheck !== 'string') {
      throw new Error('Email inválido fornecido');
    }

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const url = `${API_URL}/api/auth/check-email`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToCheck.toLowerCase() }),
      });

      if (!response.ok) {
        // Se der 404, significa que a rota não existe, então assumimos que não existe verificação
        if (response.status === 404) {
          return true; // Permite prosseguir para tentar fazer login
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      // Em caso de erro de conexão, permitir prosseguir
      return true;
    }
  };


  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Por favor, insira um email válido.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg("Formato de email inválido.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const emailExists = await checkEmailExists(trimmedEmail);

      if (emailExists) {
        localStorage.setItem('email', trimmedEmail);
        setIsExpanding(true);
        setTimeout(() => {
          setStep("password");
          setIsExpanding(false);
        }, 300);
      } else {
        setStep("signup");
      }
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      setErrorMsg("Erro ao verificar email. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      setErrorMsg("Por favor, insira sua senha.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setErrorMsg("Senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await login(email, trimmedPassword);
      await checkDISCCompletion();
    } catch (error) {
      console.error("Erro no login:", error);

      if (error.message.includes('Erro de conexão')) {
        setErrorMsg("Erro de conexão. Verifique sua internet e tente novamente.");
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setErrorMsg("Email ou senha incorretos.");
      } else if (error.message.includes('429')) {
        setErrorMsg("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else if (error.message.includes('fetch') || error.name === 'TypeError') {
        setErrorMsg("Erro de conexão. Verifique sua internet e tente novamente.");
      } else {
        setErrorMsg(error.message || "Falha no login. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkDISCCompletion = async () => {
    console.log("🔍 checkDISCCompletion chamado");
    try {
      if (!user?.id) {
        console.log("🔍 Usuário sem ID, navegando para dashboard");
        navigate("/dashboard");
        return;
      }

      // Cache simples para evitar consultas desnecessárias
      const cacheKey = `disc_completed_${user.id}`;
      const cachedResult = localStorage.getItem(cacheKey);
      const cacheExpiry = localStorage.getItem(`${cacheKey}_expiry`);
      
      // Se tem cache válido (expira em 1 hora)
      if (cachedResult && cacheExpiry && Date.now() < parseInt(cacheExpiry)) {
        const isCompleted = cachedResult === 'true';
        console.log("🔍 Usando cache - DISC completado:", isCompleted);
        
        if (isCompleted) {
          navigate("/dashboard");
          return;
        } else {
          setShowDISCModal(true);
          return;
        }
      }

      // Verificar se usuário já completou teste DISC
      console.log("🔍 Verificando testes do usuário ID:", user.id);
      
      // Buscar testes psicológicos do usuário
      const userTests = await testService.getUserPsychologicalTests(user.id, 'completed', 50);
      console.log("🔍 Testes encontrados:", userTests);
      
      // Verificar se há algum teste DISC ou unified completado
      const hasCompletedDISC = userTests && userTests.length > 0 && 
        userTests.some(test => 
          (test.test_type === 'DISC' || test.test_type === 'unified') && 
          test.status === 'completed'
        );

      console.log("🔍 hasCompletedDISC:", hasCompletedDISC);
      
      // Salvar no cache (expira em 1 hora)
      localStorage.setItem(cacheKey, hasCompletedDISC.toString());
      localStorage.setItem(`${cacheKey}_expiry`, (Date.now() + 3600000).toString());
      
      if (!hasCompletedDISC) {
        // Usuário não completou o teste DISC, mostrar modal
        console.log("🔍 Mostrando modal DISC");
        setShowDISCModal(true);
      } else {
        // Usuário já completou, ir direto para dashboard
        console.log("🔍 DISC já completado, navegando para dashboard");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("🔍 Erro ao verificar teste DISC:", error);
      
      // Tentar método de fallback usando API antiga
      try {
        console.log("🔍 Tentando método de fallback...");
        const discResult = await testService.checkDISCCompletion(user.id);
        console.log("🔍 Resultado fallback:", discResult);
        
        if (discResult && discResult.completed) {
          console.log("🔍 DISC completado via fallback, navegando para dashboard");
          
          // Atualizar cache
          const cacheKey = `disc_completed_${user.id}`;
          localStorage.setItem(cacheKey, 'true');
          localStorage.setItem(`${cacheKey}_expiry`, (Date.now() + 3600000).toString());
          
          navigate("/dashboard");
        } else {
          console.log("🔍 DISC não completado via fallback, mostrando modal");
          setShowDISCModal(true);
        }
      } catch (fallbackError) {
        console.error("🔍 Erro no fallback:", fallbackError);
        // Em caso de erro completo, mostrar modal (melhor experiência)
        console.log("🔍 Erro total, mostrando modal por segurança");
        setShowDISCModal(true);
      }
    }
  };

  const handleDISCModalClose = () => {
    console.log("🔍 handleDISCModalClose chamado");
    setShowDISCModal(false);
    // Navegar para dashboard após fechar modal
    navigate("/dashboard", { replace: true });
  };

  const handleBackToEmail = () => {
    setStep("email");
    setPassword("");
    setErrorMsg("");
    localStorage.removeItem("email");
  };

  return (
    <>
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
        {/* Ver Vagas no canto superior direito */}
        <div className="absolute top-8 right-8 text-1xl text-white font-bold z-10 whitespace-nowrap">
          <a
            className="text-white transition duration-200 cursor-pointer hover:bg-white hover:text-black px-2 py-1 rounded"
            onClick={() => navigate("/vagas")}
          >
            Ver Vagas
          </a>
        </div>

        <Card
          className={`w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10 transition-all duration-300 ${isExpanding ? "scale-105" : ""
            }`}
        >
          <CardContent className="p-8">
            {/* Cabeçalho */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src="/1.png"
                  alt="Logo da empresa"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">AgroSkills</h1>
              <p className="text-white/70">
                {step === "email"
                  ? "Preencha seu email para logar ou criar uma conta"
                  : step === "password"
                    ? "Digite sua senha para continuar"
                    : "Crie uma nova conta"}
              </p>
            </div>

            {/* Formulário - Step Email */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                {errorMsg && (
                  <p className="text-red-400 text-center">{errorMsg}</p>
                )}

                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-white text-black hover:bg-white/90 font-medium py-3"
                >
                  {isLoading ? "Verificando..." : "Continuar"}
                </Button>
              </form>
            )}

            {/* Formulário - Step Password */}
            {step === "password" && (
              <div className="space-y-6">
                {errorMsg && (
                  <p className="text-red-400 text-center">{errorMsg}</p>
                )}

                {/* Mostrar email confirmado */}
                <div className="bg-white/5 border border-white/10 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Email:</span>
                    <span className="text-white text-sm">{email}</span>
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="text-white/50 hover:text-white text-xs underline"
                    >
                      alterar
                    </button>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                    disabled={isLoading}
                    autoFocus
                    autoComplete="current-password"
                  />

                  <Button
                    type="submit"
                    disabled={isLoading || !password}
                    className="w-full bg-white text-black hover:bg-white/90 font-medium py-3"
                  >
                    {isLoading ? "Entrando..." : "Continuar"}
                  </Button>
                </form>

                {/* Opções extras */}
                <div className="text-center mt-4">
                  <a
                    href="/forgot-password"
                    className="text-white/70 hover:text-white text-sm"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
              </div>
            )}

            {/* Formulário - Step Signup */}
            {step === "signup" && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="bg-blue-500/10 border border-blue-400/20 rounded-md p-4">
                    <h3 className="text-blue-300 font-medium mb-2">Email não encontrado!</h3>
                    <p className="text-white/70 text-sm">
                      O email <span className="text-white font-medium">{email}</span> não está cadastrado em nossa plataforma.
                    </p>
                  </div>

                  <p className="text-white/70 text-sm">
                    Que tal criar uma nova conta? É rápido e gratuito!
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/signup", { state: { email } })}
                    className="w-full bg-green-600 text-white hover:bg-green-700 font-medium py-3"
                  >
                    Criar Nova Conta
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleBackToEmail}
                    className="w-full border-white/20 text-white bg-white/5 font-medium py-3"
                  >
                    Tentar Outro Email
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Incentivo ao Teste DISC */}
        <DISCIncentiveModal
          isOpen={showDISCModal}
          onClose={handleDISCModalClose}
        />
      </div>
    </>
  );
};

export default LoginPage;
