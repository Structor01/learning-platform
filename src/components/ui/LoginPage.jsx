// src/components/ui/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TYPES } from "@/types/userTypes";
import DISCIncentiveModal from "./DISCIncentiveModal";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDISCModal, setShowDISCModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const loggedUser = await login(email, password);
      
      console.log("🔍 DEBUG - Usuário logado:", loggedUser);
      console.log("🔍 DEBUG - userType:", loggedUser?.userType);
      
      // Identificação automática do tipo de usuário e redirecionamento
      const userType = loggedUser.userType || USER_TYPES.CANDIDATE;
      
      console.log("🔍 DEBUG - Tipo determinado:", userType);
      console.log("🔍 DEBUG - É empresa?", userType === USER_TYPES.COMPANY);
      
      if (userType === USER_TYPES.COMPANY) {
        console.log("🔍 DEBUG - Redirecionando para dashboard-empresa");
        navigate("/dashboard-empresa");
      } else {
        console.log("🔍 DEBUG - Redirecionando para fluxo candidato");
        await checkDISCCompletion();
      }

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
      console.error('Erro ao verificar teste DISC:', error);
      // Em caso de erro, ir direto para dashboard
      navigate("/Dashboard");
    }
  };

  const handleDISCModalClose = () => {
    setShowDISCModal(false);
    navigate("/Dashboard");
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (
    <>

      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
        {/* Ver Vagas no canto superior direito */}
        <div className="absolute top-8 right-8 text-1xl text-white font-bold z-10 whitespace-nowrap">
          <a className="text-white transition duration-200 cursor-pointer hover:bg-white hover:text-black px-2 py-1 rounded"
            onClick={() => navigate("/vagas")}>
            Ver Vagas
          </a>
        </div>
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10">
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
                Aprendizado personalizado para sua carreira
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && <p className="text-red-400 text-center">{errorMsg}</p>}

              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-white/90 font-medium py-3"
              >
                {isLoading ? "Entrando..." : "Sign In"}
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
                    Forgot password?
                  </a>
                </div>
              </div>
            </form>
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
