import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const SignUpPage = () => {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // Novo estado para mensagem de sucesso
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar senha

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg(""); // Limpa mensagem de sucesso anterior

    try {
      await signup({ name, email, password });
      // Exibe mensagem de sucesso
      setSuccessMsg("Conta criada com sucesso! Bem-vindo(a)!");
      
      // Opcional: limpar o formulário após sucesso
      setName("");
      setEmail("");
      setPassword("");
      
      // opcional: redirecionar para dashboard ou login após alguns segundos
      // setTimeout(() => {
      //   window.location.href = "/login";
      // }, 2000);
      
    } catch (error) {
      console.error("Erro no signup:", error);
      setErrorMsg(error.message || "Falha ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border-white/10">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-black">G</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Criar Conta</h1>
            <p className="text-white/70">
              Comece seu aprendizado personalizado
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {/* Mensagem de erro */}
            {errorMsg && (
              <p className="text-red-400 text-sm text-center">{errorMsg}</p>
            )}

            {/* Mensagem de sucesso */}
            {successMsg && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-400 text-sm text-center font-medium">{successMsg}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-white/90 font-medium py-3"
            >
              {isLoading ? "Criando..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <a href="/login" className="text-white/70 hover:text-white text-sm">
              Já tem conta? Faça login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;