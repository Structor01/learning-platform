// src/components/ui/LoginPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TYPES } from "@/types/userTypes";
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
    console.log("🔍 Loginage useEffect disparado - user:", !!user, "accessToken:", !!accessToken, "step:", step);
    // REMOVIDO: navegação automática para dashboard, pois deve ser controlada pela função checkDISCCompletion
    // Deixar que a lógica de login e checkDISCCompletion controle a navegação
  }, [user, navigate, step, showDISCModal]);


  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Validações
    if (!trimmedEmail) {
      setErrorMsg("Por favor, insira um email válido.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg("Formato de email inválido.");
      return;
    }

    if (!trimmedPassword) {
      setErrorMsg("Por favor, insira sua senha.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const loggedUser = await login(trimmedEmail, trimmedPassword);

      // Identificação automática do tipo de usuário e redirecionamento
      const userType = loggedUser.userType || USER_TYPES.CANDIDATE;

      if (userType === USER_TYPES.COMPANY) {

        navigate("/dashboard-empresa");
      } else {
        console.log("🔍 DEBUG - Redirecionando para fluxo candidato");
        await checkDISCCompletion();
      }
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

    // Aguardar o user estar disponível
    let currentUser = user;
    if (!currentUser?.id) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          currentUser = JSON.parse(savedUser);
        } catch (e) {
          console.error("🔍 Erro ao parsear usuário do localStorage:", e);
        }
      }
    }



    try {
      if (!currentUser?.id) {
        console.lg("🔍 Usuário sem ID, navegando para dashboard");
        navigate("/dashboard");
        return;
      }

      // Para testes: descomentar a linha abaixo para limpar o cache
      // localStorage.removeItem(`disc_completed_${currentUser.id}`); localStorage.removeItem(`disc_completed_${currentUser.id}_expiry`);

      // Cache simples para evitar consultas desnecessárias
      const cacheKey = `disc_completed_${currentUser.id}`;
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
      console.log("🔍 Verificando testes do usuário ID:", currentUser.id);

      // Buscar testes psicológicos do usuário
      const userTests = await testService.getUserPsychologicalTests(currentUser.id, 'completed', 50);
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

        setShowDISCModal(true);
      } else {
        // Usuário já completou, ir direto para dashboard

        navigate("/dashboard");
      }
    } catch (error) {
      console.error("🔍 Erro ao verificar teste DISC:", error);

      // Tentar método de fallback usando API antiga
      try {

        const discResult = await testService.checkDISCCompletion(currentUser.id);


        if (discResult && discResult.completed) {


          // Atualizar cache
          const cacheKey = `disc_completed_${currentUser.id}`;
          localStorage.setItem(cacheKey, 'true');
          localStorage.setItem(`${cacheKey}_expiry`, (Date.now() + 3600000).toString());

          navigate("/dashboard");
        } else {

          setShowDISCModal(true);
        }
      } catch (fallbackError) {

        // Em caso de erro completo, mostrar modal (melhor experiência)

        setShowDISCModal(true);
      }
    }
  };

  const handleDISCModalClose = () => {

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Elementos de background decorativos */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Ver Vagas no canto superior direito
        <div className="absolute top-6 right-6 z-10">
          <button
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm"
            onClick={() => navigate("/vagas")}
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            Ver Vagas
          </button>
        </div> */}

        <Card
          className={`w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 relative z-10 ${isExpanding ? "scale-[1.02] shadow-3xl" : ""} sm:max-w-md`}
        >
          <CardContent className="p-6 sm:p-8">
            {/* Cabeçalho */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <img
                  src="/1.png"
                  alt="Logo da empresa"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">AgroSkills</h1>
              <p className="text-white/80 text-lg leading-relaxed">
                Entre na sua conta ou crie uma nova
              </p>
            </div>

            {/* Formulário de Login */}
            <div className="space-y-6">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4">
                  <p className="text-red-300 text-sm text-center flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errorMsg}
                  </p>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {/* Campo de Email */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <Input
                    type="email"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-12 py-3 rounded-xl focus:ring-2 focus:ring-white/30 transition-all duration-200"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                {/* Campo de Senha */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-12 py-3 rounded-xl focus:ring-2 focus:ring-white/30 transition-all duration-200"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full bg-gradient-to-r from-white to-gray-100 text-gray-900 hover:from-gray-100 hover:to-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Entrar
                    </div>
                  )}
                </Button>
              </form>

              {/* Link para esqueci a senha */}
              <div className="text-center">
                <a
                  href="/forgot-password"
                  className="text-white/60 hover:text-white text-sm underline transition-colors duration-200 flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Esqueci minha senha
                </a>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-white/60">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/signup")}
                className="w-full border-white/30 text-black  font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.01]"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Criar nova conta
              </Button>
            </div>

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
