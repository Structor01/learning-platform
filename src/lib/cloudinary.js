export const uploadToCloudinary = async (file, folder = 'profiles') => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    console.log('🔍 Debug Cloudinary:');
    console.log('  - CLOUD_NAME:', cloudName);
    console.log('  - UPLOAD_PRESET:', uploadPreset);
    console.log('  - URL completa:', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    if (!cloudName || !uploadPreset) {
        throw new Error('Variáveis de ambiente do Cloudinary não configuradas!');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', `agroskills/${folder}`);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        console.log('📡 Cloudinary response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Cloudinary error:', errorData);
            throw new Error(`Falha no upload: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Upload success:', data.secure_url);
        return data.secure_url;
    } catch (error) {
        console.error('❌ Erro ao fazer upload no Cloudinary:', error);
        throw error;
    }
};