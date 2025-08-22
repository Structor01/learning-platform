// src/components/ui/ForgotPassword.jsx - VERSÃO SIMPLES QUE DEVE FUNCIONAR
import React, {useEffect, useState} from "react";
import { API_URL } from "../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      const emailSaved = localStorage.getItem('email');
      setEmail(emailSaved);
  }, [])
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem("");

    try {
      console.log("🔄 Enviando forgot password...");
      console.log("📧 Email:", email);
      console.log("🌐 API_URL:", API_URL);

      const url = `${API_URL}/api/auth/forgot-password`;
      console.log("🔗 URL:", url);

      const response = await fetch(url, {
        method: "POST", // ✅ Método correto
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // ✅ Payload correto
      });

      console.log("📡 Status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Sucesso:", data);
        setMensagem(`✅ ${data.message}`);
      } else {
        const errorData = await response.json();
        console.log("❌ Erro:", errorData);
        setMensagem(`❌ ${errorData.message || 'Erro ao enviar e-mail'}`);
      }

    } catch (err) {
      console.error("❌ Erro completo:", err);

      if (err.message.includes('Failed to fetch')) {
        setMensagem("❌ Erro de conexão. Verifique se o backend está rodando.");
      } else {
        setMensagem(`❌ Erro: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Recuperar senha
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className={`w-full font-medium py-3 rounded transition-all ${loading
                  ? "bg-gray-600 cursor-not-allowed text-gray-300"
                  : "bg-white text-black hover:bg-white/90"
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </div>
              ) : (
                "Enviar"
              )}
            </button>
          </form>

          {mensagem && (
            <div className={`mt-4 p-3 rounded text-center text-sm ${mensagem.includes('✅')
                ? 'bg-green-900/30 text-green-300 border border-green-700/50'
                : 'bg-red-900/30 text-red-300 border border-red-700/50'
              }`}>
              {mensagem}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}