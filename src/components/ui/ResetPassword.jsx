// src/components/ui/ResetPassword.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [mensagem, setMensagem] = useState("");
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:3001/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMensagem("Senha atualizada com sucesso!");
      } else {
        setMensagem(data.message || "Erro ao redefinir a senha.");
      }
    } catch (err) {
      setMensagem("Erro inesperado.");
    }
  };

  return (
    <div className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Redefinir Senha
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/50"
            required
          />

          <button
            type="submit"
            className="w-full bg-white text-black font-medium py-3 rounded hover:bg-white/90"
          >
            Atualizar senha
          </button>
        </form>

        {mensagem && <p className="mt-4 text-white text-center">{mensagem}</p>}
      </div>
    </div>
  );
}
