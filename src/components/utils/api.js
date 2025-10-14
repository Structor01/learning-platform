export const getApiUrl = () => {

    // Verificar se está em desenvolvimento (localhost, 127.0.0.1, ou qualquer IP local)
    const isLocalDevelopment = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.') ||
        import.meta.env.MODE === 'development';

    if (!isLocalDevelopment) {
        return 'https://learning-platform-backend-2x39.onrender.com';
    }

    // Em desenvolvimento, usar proxy do Vite (sem especificar URL completa)
    const url = import.meta.env.VITE_API_URL || '';
    return url;
};

export const API_URL = getApiUrl();