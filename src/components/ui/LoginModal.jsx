// src/components/ui/LoginModal.jsx
import React, { useState } from 'react';
import { X, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { API_URL } from '../utils/api';

const LoginModal = ({ isOpen, onClose, onLogin, onSignup }) => {
    const navigate = useNavigate();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (isLoginMode) {
                const result = await onLogin(formData);

                // Se o login foi bem-sucedido
                if (result && result.success) {
                    // Salvar token no localStorage
                    localStorage.setItem("authToken", result.token);
                    localStorage.setItem("userData", JSON.stringify(result.user));

                    // Chamar callback para atualizar estado na página pai
                    if (onLoginSuccess) {
                        onLoginSuccess(result.user);
                    }

                    // Fechar modal
                    onClose();

                    // Resetar formulário
                    setFormData({ email: "", password: "", name: "" });
                }
            } else {
                const result = await onSignup(formData);

                if (result && result.success) {
                    // Auto-login após signup
                    localStorage.setItem("authToken", result.token);
                    localStorage.setItem("userData", JSON.stringify(result.user));

                    if (onLoginSuccess) {
                        onLoginSuccess(result.user);
                    }

                    onClose();
                    setFormData({ email: "", password: "", name: "" });
                }
            }
        } catch (err) {
            setError(err.message || "Erro ao fazer login/cadastro");
        } finally {
            setIsLoading(false);
        }
    };

    const goToSignup = () => {
        navigate("/signup");
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border-gray-800 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden border">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {isLoginMode ? 'Fazer Login' : 'Criar Conta'}
                        </h2>
                        <p className="text-orange-100">
                            {isLoginMode
                                ? 'Entre para se candidatar às vagas'
                                : 'Crie sua conta para começar'
                            }
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLoginMode && (
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Nome completo
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        required={!isLoginMode}
                                        placeholder="Seu nome completo"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                E-mail
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    required
                                    placeholder="seu@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Sua senha"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                        >
                            {isLoginMode ? 'Entrar' : 'Criar Conta'}
                        </button>
                    </form>


                    <div className="text-center mt-4 space-y-2">
                        <button
                            type="button"
                            onClick={goToSignup}
                            className="text-white hover:text-gray-300 text-sm"
                        >
                            Não tem uma conta?{" "}
                            <span className="underline">Cadastre-se</span>
                        </button>

                        <div>
                            <a
                                href="/forgot-password"
                                className="text-white hover:text-gray-300 text-sm"
                            >
                                Forgot password?
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginModal;