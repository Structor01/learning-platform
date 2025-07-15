// src/components/ui/ForgotPassword.jsx
import React, { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:3001/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMensagem("Instruções enviadas para seu e-mail.");
      } else {
        setMensagem(data.message || "Erro ao enviar e-mail.");
      }
    } catch (err) {
      setMensagem("Erro inesperado.");
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
              className="w-full p-3 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/50"
              required
            />
            <button
              type="submit"
              className="w-full bg-white text-black font-medium py-3 rounded hover:bg-white/90"
            >
              Enviar
            </button>
          </form>
          {mensagem && (
            <p className="mt-4 text-white text-center">{mensagem}</p>
          )}
        </div>
      </div>
    </div>
  );
}
