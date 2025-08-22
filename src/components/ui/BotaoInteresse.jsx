import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../utils/api';

const BotaoInteresse = ({ 
    vaga, 
    isAuthenticated, 
    user,
    onLoginRequired,
    showNotification 
}) => {
    const [temInteresse, setTemInteresse] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Verificar se já tem interesse ao montar o componente
    useEffect(() => {
        if (isAuthenticated && user?.id && vaga?.id) {
            verificarInteresse();
        }
    }, [isAuthenticated, user?.id, vaga?.id]);

    const verificarInteresse = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(
                `${API_URL}/api/interesses/vaga/${vaga.id}/status`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setTemInteresse(response.data.temInteresse);
        } catch (error) {
            console.error('Erro ao verificar interesse:', error);
        }
    };

    const handleToggleInteresse = async () => {
        if (!isAuthenticated) {
            onLoginRequired();
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        const token = localStorage.getItem('accessToken');

        try {
            if (temInteresse) {
                // Remover interesse
                await axios.delete(
                    `${API_URL}/api/interesses/vaga/${vaga.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                
                setTemInteresse(false);
                showNotification({
                    type: 'success',
                    title: 'Interesse removido',
                    message: `Você removeu o interesse na vaga ${vaga.title || vaga.nome}`,
                    duration: 3000
                });
            } else {
                // Adicionar interesse
                await axios.post(
                    `${API_URL}/api/interesses`,
                    { vagaId: vaga.id },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                
                setTemInteresse(true);
                showNotification({
                    type: 'success',
                    title: 'Interesse adicionado!',
                    message: `Vaga ${vaga.title || vaga.nome} salva em seus interesses`,
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('Erro ao toggle interesse:', error);
            
            if (error.response?.status === 400) {
                showNotification({
                    type: 'error',
                    title: 'Ação não permitida',
                    message: error.response.data.message || 'Apenas vagas externas podem receber interesse',
                    duration: 4000
                });
            } else if (error.response?.status === 409) {
                setTemInteresse(true);
                showNotification({
                    type: 'info',
                    title: 'Interesse já existe',
                    message: 'Você já demonstrou interesse nesta vaga',
                    duration: 3000
                });
            } else {
                showNotification({
                    type: 'error',
                    title: 'Erro',
                    message: 'Não foi possível processar sua solicitação',
                    duration: 3000
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Só mostrar o botão se a vaga for externa
    if (vaga.tipo !== 'externa') {
        return null;
    }

    return (
        <button
            onClick={handleToggleInteresse}
            disabled={isLoading}
            className={`
                group relative p-3 rounded-xl transition-all duration-300 
                ${temInteresse 
                    ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30' 
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={temInteresse ? 'Remover dos interesses' : 'Adicionar aos interesses'}
        >
            <Heart 
                className={`
                    w-6 h-6 transition-all duration-300
                    ${temInteresse 
                        ? 'text-red-500 fill-red-500 scale-110' 
                        : 'text-gray-400 group-hover:text-red-400 group-hover:scale-110'
                    }
                `}
            />
            
            {/* Tooltip */}
            <span className={`
                absolute -top-10 left-1/2 -translate-x-1/2 
                px-3 py-1 bg-gray-900 text-white text-xs rounded-lg
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                pointer-events-none whitespace-nowrap z-10
                ${temInteresse ? 'bg-red-900' : ''}
            `}>
                {temInteresse ? 'Remover interesse' : 'Salvar vaga'}
            </span>
        </button>
    );
};

export default BotaoInteresse;
