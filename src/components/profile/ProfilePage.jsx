import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/ui/Navbar";
import ProfileHeader from "./ProfileHeader";
import ProfileAbout from "./ProfileAbout";
import ProfileExperience from "./ProfileExperience";
import ProfileEducation from "./ProfileEducation";
import ProfileSkills from "./ProfileSkills";

// ✅ Patch genérico para qualquer endpoint de profile (usando o helper api())
const patchProfile = async (path, data = {}) => {
    const fullPath = `/api/profile${path}`;
    console.log(`🔄 Fazendo PATCH para: ${fullPath}`, data);
    try {
        const result = await api(fullPath, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        console.log(`✅ Resposta do PATCH ${fullPath}:`, result);
        return result;
    } catch (error) {
        console.error(`❌ Erro ao fazer PATCH ${fullPath}:`, error);
        throw error;
    }
};

const ProfilePage = () => {
    const { user, updateUser, isLoading } = useAuth();
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [profileData, setProfileData] = useState({
        about: "",
        experiences: [],
        education: [],
        skills: [],
    });

    // ✅ Carregar dados iniciais do usuário e sincronizar quando mudarem
    useEffect(() => {
        if (user) {
            console.log("📋 ProfilePage - Carregando user do context:", {
                about: user.about,
                experiences: user.experiences,
                education: user.education,
                skills: user.skills,
            });

            // ⚠️ Parse strings JSON para arrays se necessário
            const parseJsonField = (field) => {
                if (!field) return [];

                let parsed = field;

                // Parse se for string
                if (typeof field === 'string') {
                    try {
                        parsed = JSON.parse(field);
                    } catch {
                        return [];
                    }
                }

                if (!Array.isArray(parsed)) return [];

                // ✅ Remove arrays vazios e objetos sem dados relevantes
                return parsed.filter(item => {
                    if (Array.isArray(item)) return item.length > 0;
                    if (!item || typeof item !== 'object') return false;

                    // Verifica se tem pelo menos um campo preenchido (além de 'id')
                    return Object.keys(item).some(key =>
                        key !== 'id' && item[key] !== '' && item[key] !== null && item[key] !== undefined
                    );
                });
            };

            const normalized = {
                about: user.about || "",
                experiences: parseJsonField(user.experiences),
                education: parseJsonField(user.education),
                skills: parseJsonField(user.skills),
            };

            console.log("✅ ProfilePage - Dados normalizados:", normalized);
            setProfileData(normalized);
        }
    }, [user]);


    // ✅ Upload de imagem -> usa PATCH /banner
    // ✅ Upload de imagem -> usa PATCH /banner
    // const handleBannerUpload = async (event) => {
    //     const file = event.target.files[0];
    //     if (!file) return;

    //     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    //     if (!allowedTypes.includes(file.type)) {
    //         alert('Formato de arquivo não suportado. Use JPEG, PNG ou GIF.');
    //         return;
    //     }

    //     const maxSize = 5 * 1024 * 1024;
    //     if (file.size > maxSize) {
    //         alert('Arquivo muito grande. Máximo: 5MB.');
    //         return;
    //     }

    //     try {
    //         setIsUploadingImage(true);

    //         const reader = new FileReader();
    //         reader.onload = async (e) => {
    //             const base64Image = e.target.result;

    //             try {
    //                 // ✅ envia base64 ao backend
    //                 const response = await patchProfile("/banner", {
    //                     banner_image: base64Image,
    //                 });

    //                 console.log("✅ PATCH /banner bem-sucedido");

    //                 // ✅ backend deve retornar a URL final da imagem
    //                 const bannerUrl =
    //                     response?.banner_image ||
    //                     response?.banner_url ||
    //                     response?.image_url;

    //                 if (!bannerUrl) {
    //                     console.warn("Backend não retornou URL");
    //                 }

    //                 // ✅ ATUALIZA o localStorage apenas com a URL
    //                 const updatedUser = {
    //                     ...user,
    //                     banner_image: bannerUrl
    //                 };

    //                 await updateUser(updatedUser);

    //                 alert("Banner atualizado!");
    //             } catch (backendError) {
    //                 console.warn("⚠️ Backend falhou:", backendError);
    //                 alert("Erro ao enviar imagem.");
    //             }
    //         };

    //         reader.readAsDataURL(file);
    //     } catch (error) {
    //         console.error("Erro ao fazer upload:", error);
    //         alert("Erro ao atualizar banner.");
    //     }
    // };


    // FOTO DE PERFIL
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Formato de arquivo não suportado. Use JPEG, PNG ou GIF.');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('Arquivo muito grande. Máximo: 5MB.');
            return;
        }

        try {
            setIsUploadingImage(true);

            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Image = e.target.result;

                try {
                    // ✅ Envia apenas ao backend
                    const response = await patchProfile("/profile-image", {
                        profile_image: base64Image,
                    });

                    // ✅ Pega apenas a URL retornada
                    const imageUrl =
                        response?.profile_image ||
                        response?.profile_url ||
                        response?.image_url;

                    // ✅ Agora sim atualiza o localStorage
                    if (imageUrl) {
                        const updatedUser = { ...user, profile_image: imageUrl };
                        await updateUser(updatedUser);
                    }

                    alert("Foto de perfil atualizada!");
                } catch (backendError) {
                    console.warn("⚠️ Backend falhou:", backendError);
                }
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Erro ao fazer upload:", error);
            alert("Erro ao atualizar foto.");
        } finally {
            setIsUploadingImage(false);
        }
    };


    // ✅ Deletar imagem de perfil
    const handleDeleteImage = async () => {
        if (!window.confirm("Tem certeza que deseja deletar a foto de perfil?")) {
            return;
        }

        try {
            // Fazer requisição ao backend para deletar
            try {
                await patchProfile("/banner", {
                    banner_image: null,
                });
                console.log("✅ PATCH /banner (delete) bem-sucedido");
            } catch (backendError) {
                console.warn("⚠️ Backend falhou ao deletar, mas vamos remover localmente:", backendError);
            }

            // ✅ Atualizar o user context removendo a imagem + mantendo todos os dados anteriores
            const updatedUser = { ...user, banner_image: null };
            console.log("🗑️ Removendo imagem do localStorage");
            await updateUser(updatedUser);

            alert("Foto de perfil removida!");
        } catch (error) {
            console.error("❌ Erro ao deletar foto:", error);
            alert("Erro ao remover foto.");
        }
    };

    // ✅ Atualizar SOBRE -> PATCH /about
    const handleUpdateAbout = async (data) => {
        try {
            console.log("📝 Iniciando atualização de about com dados:", data.about);

            // 1. Atualizar o estado local imediatamente (otimista)
            setProfileData(prev => ({ ...prev, about: data.about }));

            // 2. Sincronizar com o context do usuário PRIMEIRO (isso salva no localStorage)
            const updatedUser = { ...user, about: data.about };
            console.log("📝 Salvando user com about no localStorage");
            await updateUser(updatedUser);

            // 3. Fazer a requisição ao backend (tenta persistir no BD)
            try {
                await patchProfile("/about", { about: data.about });
                console.log("✅ PATCH /about bem-sucedido");
            } catch (backendError) {
                console.warn("⚠️ Backend falhou, mas dados estão salvos localmente:", backendError);
            }

            console.log("✅ Usuário context atualizado com about:", updatedUser.about);

        } catch (error) {
            console.error("❌ Erro ao atualizar sobre:", error);
            // Reverter o estado local em caso de erro
            setProfileData(prev => ({ ...prev, about: user?.about || "" }));

        }
    };

    // ✅ Atualizar EXPERIÊNCIAS -> PATCH /experiences
    const handleUpdateExperiences = async (experiences) => {
        try {
            // 1. Atualizar o estado local imediatamente (otimista)
            setProfileData(prev => ({ ...prev, experiences }));

            // 2. Sincronizar com o context do usuário PRIMEIRO (isso salva no localStorage)
            const updatedUser = { ...user, experiences };
            console.log("💼 Salvando user com experiências no localStorage");
            await updateUser(updatedUser);

            // 3. Fazer a requisição ao backend (tenta persistir no BD)
            try {
                await patchProfile("/experiences", { experiences: updatedUser.experiences });
                console.log("✅ POST /experiences bem-sucedido");
            } catch (backendError) {
                console.warn("⚠️ Backend falhou, mas dados estão salvos localmente:", backendError);
            }

            console.log("✅ Usuário context atualizado");

        } catch (error) {
            console.error("❌ Erro ao atualizar experiências:", error);
            // Reverter o estado local em caso de erro
            setProfileData(prev => ({ ...prev, experiences: user?.experiences || [] }));

        }
    };

    // ✅ Atualizar EDUCAÇÃO -> PATCH /education
    const handleUpdateEducation = async (education) => {
        try {
            console.log("🎓 Iniciando atualização de educação com", education.length, "items");

            // 1. Atualizar o estado local imediatamente (otimista)
            setProfileData(prev => ({ ...prev, education }));

            // 2. Sincronizar com o context do usuário PRIMEIRO (isso salva no localStorage)
            const updatedUser = { ...user, education };
            console.log("🎓 Salvando user com educação no localStorage");
            await updateUser(updatedUser);

            // 3. Fazer a requisição ao backend (tenta persistir no BD)
            try {
                await patchProfile("/education", { education });
                console.log("✅ PATCH /education bem-sucedido");
            } catch (backendError) {
                console.warn("⚠️ Backend falhou, mas dados estão salvos localmente:", backendError);
            }

            console.log("✅ Usuário context atualizado");
        } catch (error) {
            console.error("❌ Erro ao atualizar formação:", error);
            // Reverter o estado local em caso de erro
            setProfileData(prev => ({ ...prev, education: user?.education || [] }));

        }
    };

    // ✅ Atualizar SKILLS -> PATCH /skills
    const handleUpdateSkills = async (skills) => {
        try {
            console.log("⚡ Iniciando atualização de skills com", skills.length, "items");

            // 1. Atualizar o estado local imediatamente (otimista)
            setProfileData(prev => ({ ...prev, skills }));

            // 2. Sincronizar com o context do usuário PRIMEIRO (isso salva no localStorage)
            const updatedUser = { ...user, skills };
            console.log("⚡ Salvando user com skills no localStorage");
            await updateUser(updatedUser);

            // 3. Fazer a requisição ao backend (tenta persistir no BD)
            try {
                await patchProfile("/skills", { skills });
                console.log("✅ PATCH /skills bem-sucedido");
            } catch (backendError) {
                console.warn("⚠️ Backend falhou, mas dados estão salvos localmente:", backendError);
            }

            console.log("✅ Usuário context atualizado");

        } catch (error) {
            console.error("❌ Erro ao atualizar habilidades:", error);
            // Reverter o estado local em caso de erro
            setProfileData(prev => ({ ...prev, skills: user?.skills || [] }));

        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Carregando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar />

            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 pt-20 md:pt-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">

                    <div className="lg:col-span-8 space-y-4 md:space-y-6">
                        <ProfileHeader
                            user={user}
                            onUpdateUser={updateUser}
                            onImageUpload={handleImageUpload}
                            onDeleteImage={handleDeleteImage}
                            isUploadingImage={isUploadingImage}
                            // onBannerUpload={handleBannerUpload}        // ← Banner
                            onProfileImageUpload={handleImageUpload}
                        />

                        <ProfileAbout about={profileData.about} onUpdate={handleUpdateAbout} />


                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Atividade</h2>
                            <p className="text-gray-600 text-sm md:text-base">Ainda não há atividades para mostrar</p>
                        </div>

                        <ProfileExperience experiences={profileData.experiences} onUpdate={handleUpdateExperiences} />

                        <ProfileEducation education={profileData.education} onUpdate={handleUpdateEducation} />

                        <ProfileSkills skills={profileData.skills} onUpdate={handleUpdateSkills} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
