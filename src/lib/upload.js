import { API_URL } from '@/components/utils/api';

export const uploadImage = async (file, folder = 'profile_image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
        const token = localStorage.getItem('accessToken');

        const response = await fetch(`${API_URL}/api/profile/upload-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status}`);
        }

        const result = await response.json();
        return result.url;

    } catch (error) {
        console.error('❌ Erro ao fazer upload:', error);
        throw error;
    }
};