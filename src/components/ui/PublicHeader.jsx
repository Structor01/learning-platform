// src/components/ui/PublicHeader.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, LogOut, Settings, ChevronDown } from 'lucide-react';

const getApiUrl = () => {
    if (window.location.hostname !== 'localhost') {
        return 'https://learning-platform-backend-2x39.onrender.com';
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};
const API_URL = getApiUrl();

const PublicHeader = ({ title, subtitle }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
        navigate('/');
    };

    const handleLogin = () => {
        navigate('/');
    };

    const handleMinhasCandidaturas = () => {
        navigate('/minhas-candidaturas');
        setShowDropdown(false);
    };

    const handleDashboard = () => {
        navigate('/dashboard');
        setShowDropdown(false);
    };

    return (
        <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo/Title */}
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate('/vagas')}
                    >
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-green-700 bg-clip-text text-transparent">
                                {title || 'AgroSkills'}
                            </h1>
                            {subtitle && (
                                <p className="text-sm text-gray-600">{subtitle}</p>
                            )}
                        </div>
                    </div>

                    {/* User Area */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            // Usuário logado
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-3 bg-white/60 backdrop-blur rounded-full px-4 py-2 border border-blue-200 hover:border-blue-300 transition-all duration-200"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-semibold">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-gray-700 font-medium hidden sm:block">
                                        {user.name}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <>
                                        {/* Overlay para fechar o dropdown */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowDropdown(false)}
                                        />

                                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-20">
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-sm font-semibold">
                                                            {user.name?.charAt(0)?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <button
                                                    onClick={handleDashboard}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <Settings className="w-4 h-4 text-blue-500" />
                                                    <span>Dashboard</span>
                                                </button>

                                                <button
                                                    onClick={handleMinhasCandidaturas}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <Briefcase className="w-4 h-4 text-green-500" />
                                                    <span>Minhas Candidaturas</span>
                                                </button>
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-gray-100 pt-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>Sair</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            // Usuário não logado
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleLogin}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline">Entrar</span>
                                </button>

                                <button
                                    onClick={handleLogin}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                                >
                                    Fazer Login
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicHeader;