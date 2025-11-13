export const uploadToCloudinary = async (file, folder = 'profiles') => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    ('🔍 Debug Cloudinary:');
    ('  - CLOUD_NAME:', cloudName);
    ('  - UPLOAD_PRESET:', uploadPreset);
    ('  - URL completa:', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

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

        ('📡 Cloudinary response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Cloudinary error:', errorData);
            throw new Error(`Falha no upload: ${response.status}`);
        }

        const data = await response.json();
        ('✅ Upload success:', data.secure_url);
        return data.secure_url;
    } catch (error) {
        console.error('❌ Erro ao fazer upload no Cloudinary:', error);
        throw error;
    }
};