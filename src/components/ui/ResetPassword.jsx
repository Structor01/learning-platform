// src/components/ui/ResetPassword.jsx
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // <— pega ?token=...
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Token inválido.");
      return;
    }
    try {
      await axios.post("http://localhost:3001/auth/reset-password", {
        token,
        password,
      });
      // redireciona para login ao sucesso
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao resetar senha");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-4">
      <h2 className="text-xl mb-4">Atualizar senha</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-4"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2">
          Atualizar senha
        </button>
      </form>
    </div>
  );
}
