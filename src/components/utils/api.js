export const getApiUrl = () => {
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return import.meta.env.VITE_API_URL || 'http://localhost:3001';
    }

    return import.meta.env.VITE_API_URL || 'https://learning-platform-backend-2x39.onrender.com';
};

export const API_URL = getApiUrl()