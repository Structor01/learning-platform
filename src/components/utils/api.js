export const getApiUrl = () => {
    // Verificar se está em desenvolvimento (localhost, 127.0.0.1, ou qualquer IP local)
    const isLocalDevelopment = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.') ||
        import.meta.env.MODE === 'development';

    if (!isLocalDevelopment) {
        // Em produção, sempre usar a URL correta do backend
        return 'https://learning-platform-backend-2x39.onrender.com';
    }

    // Em desenvolvimento, usar VITE_API_URL ou fallback para localhost
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

export const API_URL = getApiUrl();