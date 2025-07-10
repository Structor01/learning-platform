import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const SignUpPage = () => {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await signup({ name, email, password });
      // opcional: redirecionar para dashboard ou login
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
                placeholder="Nome"
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

            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
                minLength={6}
              />
            </div>

            {errorMsg && (
              <p className="text-red-400 text-sm text-center">{errorMsg}</p>
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
