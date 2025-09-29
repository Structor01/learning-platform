export const getApiUrl = () => {
    console.log('🔍 [API] window.location.hostname:', window.location.hostname);
    console.log('🔍 [API] import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
    console.log('🔍 [API] import.meta.env.MODE:', import.meta.env.MODE);

    // Verificar se está em desenvolvimento (localhost, 127.0.0.1, ou qualquer IP local)
    const isLocalDevelopment = window.location.hostname === 'localhost' ||
                              window.location.hostname === '127.0.0.1' ||
                              window.location.hostname.startsWith('192.168.') ||
                              window.location.hostname.startsWith('10.') ||
                              import.meta.env.MODE === 'development';

    if (!isLocalDevelopment) {
        console.log('🔍 [API] Usando URL de produção');
        return 'https://learning-platform-backend-2x39.onrender.com';
    }

    const url = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    console.log('🔍 [API] Usando URL local:', url);
    return url;
};

export const API_URL = getApiUrl();