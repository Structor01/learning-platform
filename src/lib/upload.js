import { api } from '@/lib/api';

export const uploadImage = async (file, folder = 'profile_image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const result = await api('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
    });

    return result.url;
};