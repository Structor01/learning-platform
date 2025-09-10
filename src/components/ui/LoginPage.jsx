// src/components/ui/LoginPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import DISCIncentiveModal from "./DISCIncentiveModal";

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
    const token = localStorage.getItem("token");
    if (user && token) {
      navigate("/Dashboard", { replace: true });
    }
  }, [user, navigate]);


  // Função para verificar se o email existe no banco
  const checkEmailExists = async (emailToCheck) => {
    if (!emailToCheck || typeof emailToCheck !== 'string') {
      throw new Error('Email inválido fornecido');
    }

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const url = `${API_URL}/api/auth/check-email`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToCheck.toLowerCase() }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (typeof data.exists !== 'boolean') {
        throw new Error('Resposta inválida do servidor');
      }

      return data.exists;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Tempo limite de conexão excedido');
      }

      console.error("Erro ao verificar email:", error);
      throw error;
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

      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        setErrorMsg("Erro de conexão. Verifique sua internet e tente novamente.");
      } else if (error.message.includes('500')) {
        setErrorMsg("Erro interno do servidor. Tente novamente em alguns minutos.");
      } else if (error.message.includes('404')) {
        setErrorMsg("Serviço não encontrado. Entre em contato com o suporte.");
      } else {
        setErrorMsg("Erro ao verificar email. Tente novamente.");
      }
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

      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
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
    try {
      // TODO: Pegar userId real do contexto de autenticação
      const userId = 3; // Usar ID 3 para simular usuário que não fez teste

      // Simular verificação - para demonstração, sempre mostrar modal
      // Em produção, usar: const response = await fetch(`${API_URL}/api/api/tests/check-disc/${userId}`);
      const hasCompletedDISC = false; // Simular que não completou

      if (!hasCompletedDISC) {
        // Usuário não completou o teste DISC, mostrar modal
        setShowDISCModal(true);
      } else {
        // Usuário já completou, ir direto para dashboard
        navigate("/Dashboard");
      }
    } catch (error) {
      console.error("Erro ao verificar teste DISC:", error);
      // Em caso de erro, ir direto para dashboard
      navigate("/Dashboard");
    }
  };

  const handleDISCModalClose = () => {
    setShowDISCModal(false);
    navigate("/Dashboard");
  };

  const handleBackToEmail = () => {
    setStep("email");
    setPassword("");
    setErrorMsg("");
  };

  const goToSignup = () => {
    navigate("/signup");
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
