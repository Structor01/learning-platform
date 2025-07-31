export const getApiUrl = () => {
    if (window.location.hostname !== 'localhost') {
        return 'https://learning-platform-backend-2x39.onrender.com';
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

export const API_URL = getApiUrl();