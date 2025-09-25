import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { USER_TYPES } from "@/types/userTypes";
import { formatCNPJ, isValidEmail } from "@/types/company";
import { Eye, EyeOff, User, Building2 } from "lucide-react";

const SignUpPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState(USER_TYPES.CANDIDATE);
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(""); // Novo estado para mensagem de sucesso
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar senha
  const [cpf, setCpf] = useState(""); // CPF com máscara

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setEmail(email);
    }
  }, []);

  // Máscara de CPF: 000.000.000-00
  const formatCPF = (value) => {
    return value
      .replace(/\D/g, "")          // mantém apenas dígitos
      .slice(0, 11)                // limita a 11 dígitos
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg(""); // Limpa mensagem de sucesso anterior

    // Validação simples de CPF (somente tamanho de 11 dígitos)
    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      setIsLoading(false);
      setErrorMsg("CPF inválido. Informe 11 dígitos.");
      return;
    }

    try {
      // Validações específicas para empresa
      if (userType === USER_TYPES.COMPANY) {
        if (!companyName.trim()) {
          setErrorMsg("Nome da empresa é obrigatório");
          return;
        }
        if (!cnpj.trim()) {
          setErrorMsg("CNPJ é obrigatório");
          return;
        }
        const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
        if (cleanCNPJ.length < 11) {
          setErrorMsg("CNPJ deve ter pelo menos 11 dígitos");
          return;
        }
      }

      const signupData = {
        name,
        email,
        password,
        userType
      };

      if (userType === USER_TYPES.COMPANY) {
        signupData.companyName = companyName;
        signupData.cnpj = cnpj.replace(/[^\d]/g, ''); // Remove formatação
      }

      await signup(signupData);
      // Exibe mensagem de sucesso
      setSuccessMsg("Conta criada com sucesso! Bem-vindo(a)!");

      // Opcional: limpar o formulário após sucesso
      setName("");
      setPassword("");
      setCompanyName("");
      setCnpj("");

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);

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
              <img
                src="/1.png"
                alt="Logo da empresa"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Criar Conta</h1>
            <p className="text-white/70">
              Comece seu aprendizado personalizado
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de Tipo de Usuário */}
            <div className="space-y-3">
              <p className="text-white/80 text-sm">Tipo de Conta</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType(USER_TYPES.CANDIDATE)}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-all ${userType === USER_TYPES.CANDIDATE
                      ? 'bg-white/20 border-white/40 text-white'
                      : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                >
                  <User className="mr-2 h-4 w-4" />
                  Candidato
                </button>
                <button
                  type="button"
                  onClick={() => setUserType(USER_TYPES.COMPANY)}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-all ${userType === USER_TYPES.COMPANY
                      ? 'bg-white/20 border-white/40 text-white'
                      : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Empresa
                </button>
              </div>
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
                type="text"
                placeholder={userType === USER_TYPES.COMPANY ? "Nome do Responsável" : "Nome Completo"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>

            {/* Campos específicos para empresa */}
            {userType === USER_TYPES.COMPANY && (
              <>
                <div>
                  <Input
                    type="text"
                    placeholder="Nome da Empresa"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    placeholder="CNPJ (somente números ou com formatação)"
                    value={cnpj}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Permite apenas números e formatação básica
                      value = value.replace(/[^\d./-]/g, '');
                      setCnpj(value);
                    }}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                    maxLength={18} // XX.XXX.XXX/XXXX-XX
                  />
                </div>
              </>
            )}

            <div>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="CPF"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                maxLength={14} // 000.000.000-00
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