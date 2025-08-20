// src/components/ui/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import DISCIncentiveModal from "./DISCIncentiveModal";

const LoginPage = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDISCModal, setShowDISCModal] = useState(false);

  // Novos estados para controlar o fluxo
  const [step, setStep] = useState("email"); // "email", "password" ou "signup"
  const [isExpanding, setIsExpanding] = useState(false);

  // Estados para o cadastro
  const [name, setName] = useState("");

  // Função para verificar se o email existe no banco
  const checkEmailExists = async (emailToCheck) => {
    try {
      // URL da API
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const url = `${API_URL}/api/auth/check-email`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToCheck }),
      });

      if (!response.ok) {
        throw new Error("Erro ao verificar email");
      }

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      throw error;
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const emailExists = await checkEmailExists(email);

      if (emailExists) {
        // Email existe, expandir para mostrar campo de senha
        setIsExpanding(true);
        setTimeout(() => {
          setStep("password");
          setIsExpanding(false);
        }, 300);
      } else {
        // Email não existe, expandir para mostrar cadastro
        setIsExpanding(true);
        setTimeout(() => {
          setStep("signup");
          setIsExpanding(false);
        }, 300);
      }
    } catch (error) {
      setErrorMsg("Erro ao verificar email. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await login(email, password);
      await checkDISCCompletion();
    } catch (error) {
      setErrorMsg(error.message || "Falha no login");
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

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await signup({ name, email, password });
      await checkDISCCompletion();
    } catch (error) {
      setErrorMsg(error.message || "Falha ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setPassword("");
    setName("");
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
          className={`w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10 transition-all duration-300 ${
            isExpanding ? "scale-105" : ""
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
                  ? "Aprendizado personalizado para sua carreira"
                  : step === "password"
                  ? "Digite sua senha para continuar"
                  : "Complete seu cadastro"}
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

                {/* Opções extras */}
                <div className="text-center mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={goToSignup}
                    className="text-white/90 hover:text-white text-sm"
                  >
                    Não tem uma conta?{" "}
                    <span className="underline">Cadastre-se</span>
                  </button>

                  <div>
                    <a
                      href="/forgot-password"
                      className="text-white/70 hover:text-white text-sm"
                    >
                      Esqueceu a senha?
                    </a>
                  </div>
                </div>
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
                    {isLoading ? "Entrando..." : "Sign In"}
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

            {/* Formulário - Step SignUp */}
            {step === "signup" && (
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

                <form onSubmit={handleSignUpSubmit} className="space-y-6">
                  <Input
                    type="text"
                    placeholder="Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                    disabled={isLoading}
                    autoFocus
                  />

                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading || !name || !password}
                    className="w-full bg-white text-black hover:bg-white/90 font-medium py-3"
                  >
                    {isLoading ? "Criando..." : "Criar Conta"}
                  </Button>
                </form>

                {/* Informação sobre já ter conta */}
                <div className="text-center mt-4">
                  <p className="text-white/70 text-sm">
                    Já tem uma conta com outro email?{" "}
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="text-white hover:text-white underline"
                    >
                      Voltar
                    </button>
                  </p>
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
