import { api } from './api';

export const uploadImage = async (file, folder = 'profile_image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    console.log('📤 Iniciando upload...');
    console.log('📁 FormData keys:', Array.from(formData.keys()));

    const result = await api('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
    });

    return result.url;
};