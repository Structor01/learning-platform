// src/components/ui/ResetPassword.jsx - VERSÃO CORRIGIDA
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // ✅ useSearchParams em vez de useParams
import { API_URL } from "../utils/api"; // ✅ Usar constante API_URL

export default function ResetPassword() {
  const [searchParams] = useSearchParams(); // ✅ Para pegar ?token=...
  const navigate = useNavigate();

  // Estados
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ Confirmação
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const [token] = useState(searchParams.get('token')); // ✅ Pegar token da query string

  // Verificar se token existe ao carregar
  useEffect(() => {
    if (!token) {
      console.log('❌ Token não encontrado na URL');
      setMensagem("❌ Link inválido. Token não encontrado.");
    } else {
      console.log('✅ Token encontrado:', token.substring(0, 10) + '...');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMensagem("❌ Token inválido. Solicite um novo link de recuperação.");
      return;
    }

    // ✅ VALIDAÇÕES
    if (password !== confirmPassword) {
      setMensagem("❌ Senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setMensagem("❌ Senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    setMensagem("");

    try {
      console.log("🔄 Enviando reset password...");
      console.log("🔑 Token:", token.substring(0, 10) + '...');

      // ✅ CORREÇÕES:
      const url = `${API_URL}/api/auth/reset-password`; // ✅ API_URL + /api/
      console.log("🔗 URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          password: password
        }),
      });

      console.log("📡 Status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Sucesso:", data);

        setMensagem("✅ " + (data.message || "Senha atualizada com sucesso!"));

        // ✅ REDIRECIONAR para login após 3 segundos
        setTimeout(() => {
          console.log("🔄 Redirecionando para login...");
          navigate("/"); // ou navigate("/login")
        }, 3000);

      } else {
        const errorData = await response.json();
        console.log("❌ Erro:", errorData);

        if (response.status === 400) {
          setMensagem("❌ " + (errorData.message || "Token inválido ou expirado"));
        } else {
          setMensagem("❌ " + (errorData.message || "Erro ao redefinir a senha"));
        }
      }
    } catch (err) {
      console.error("❌ Erro completo:", err);

      if (err.message.includes('fetch')) {
        setMensagem("❌ Erro de conexão. Verifique se o backend está funcionando.");
      } else {
        setMensagem("❌ Erro inesperado: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ SE NÃO TEM TOKEN, MOSTRAR ERRO
  if (!token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold text-white mb-4">Link Inválido</h2>
            <p className="text-gray-300 mb-6">
              Token de recuperação não encontrado na URL.
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Verifique se copiou o link completo do email ou solicite um novo link.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/forgot-password")}
                className="w-full bg-white text-black font-medium py-3 rounded hover:bg-white/90 transition-all"
              >
                📧 Solicitar Novo Link
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-600 text-white font-medium py-3 rounded hover:bg-gray-500 transition-all"
              >
                ← Voltar para Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg">
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🔐</div>
            <h2 className="text-2xl font-bold text-white">Redefinir Senha</h2>
            <p className="text-gray-400 text-sm mt-2">Digite sua nova senha</p>
          </div>

          {/* ✅ INFO DE DEBUG (remover em produção) */}
          <div className="mb-4 text-xs text-gray-400 bg-gray-800/50 p-2 rounded">
            <div>✅ Token encontrado: {token.substring(0, 10)}...</div>
            <div>🔗 Endpoint: {API_URL}/api/auth/reset-password</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nova Senha */}
            <div>
              <input
                type="password"
                placeholder="Nova senha (min. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {/* Confirmar Senha */}
            <div>
              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {/* Indicador de Força da Senha */}
            {password && (
              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Força:</span>
                  <div className="flex gap-1">
                    <div className={`w-6 h-1 rounded ${password.length >= 6 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                    <div className={`w-6 h-1 rounded ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                    <div className={`w-6 h-1 rounded ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  </div>
                  <span className={`text-xs ${password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                    {password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'Forte' : 'Fraca'}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              className={`w-full font-medium py-3 rounded transition-all ${loading || !password || !confirmPassword || password !== confirmPassword
                ? "bg-gray-600 cursor-not-allowed text-gray-300"
                : "bg-white text-black hover:bg-white/90"
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  Alterando senha...
                </div>
              ) : (
                "🔐 Atualizar Senha"
              )}
            </button>
          </form>

          {mensagem && (
            <div className={`mt-4 p-3 rounded text-center text-sm ${mensagem.includes('✅')
              ? 'bg-green-900/30 text-green-300 border border-green-700/50'
              : 'bg-red-900/30 text-red-300 border border-red-700/50'
              }`}>
              {mensagem}
              {mensagem.includes('✅') && (
                <div className="mt-2 text-xs text-green-400">
                  Redirecionando para login em alguns segundos...
                </div>
              )}
            </div>
          )}

          {/* Links de Navegação */}
          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-white text-sm transition-colors block mx-auto"
            >
              ← Voltar para Login
            </button>
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-gray-400 hover:text-white text-sm transition-colors block mx-auto"
            >
              📧 Solicitar novo link de recuperação
            </button>
          </div>

          {/* Dicas de Segurança */}
          <details className="mt-4 text-xs text-gray-400">
            <summary className="cursor-pointer hover:text-gray-300">💡 Dicas de Segurança</summary>
            <div className="mt-2 space-y-1">
              <div>• Use pelo menos 8 caracteres</div>
              <div>• Inclua letras maiúsculas e números</div>
              <div>• Evite senhas óbvias ou pessoais</div>
              <div>• Não compartilhe sua senha</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}