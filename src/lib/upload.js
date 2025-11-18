import { getApiUrl } from '@/components/utils/api';

export function api(path, init) {
    const accessToken = localStorage.getItem('accessToken')
    const baseUrl = getApiUrl()
    const url = path.startsWith('http') ? path : new URL(path, baseUrl).toString()

    const config = {
        ...init,
        headers: {
            ...init?.headers,
            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
            // NÃO define Content-Type se for FormData
            ...(!(init?.body instanceof FormData) && { 'Content-Type': 'application/json' }),
        }
    }

    return fetch(url, config)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
            }
            const contentType = response.headers.get('content-type');
            return contentType?.includes('application/json') ? response.json() : response.text();
        })
        .catch(error => {
            console.error('❌ Erro na requisição:', error);
            throw error;
        });
}

export const uploadImage = async (file, folder = 'profile_image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    console.log('📤 Iniciando upload...');
    console.log('🌐 getApiUrl():', getApiUrl());
    console.log('📁 FormData keys:', Array.from(formData.keys()));

    const result = await api('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
    });

    return result.url;
};