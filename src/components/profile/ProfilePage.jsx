import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/ui/Navbar";
import ProfileHeader from "./ProfileHeader";
import ProfileAbout from "./ProfileAbout";
import ProfileExperience from "./ProfileExperience";
import ProfileEducation from "./ProfileEducation";
import ProfileSkills from "./ProfileSkills";
import ProfileCousers from "./ProfileCousers";
import { uploadImage } from '@/lib/upload';
import { toast } from 'sonner';

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
    const { user, updateUser, setUserData, isLoading } = useAuth();
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [hasLoadedProfile, setHasLoadedProfile] = useState(false); // ← ADICIONA


    const [profileData, setProfileData] = useState({
        about: "",
        experiences: [],
        education: [],
        skills: [],
        courses: [],
    });

    useEffect(() => {
        const loadProfileData = async () => {
            if (!user?.id || hasLoadedProfile) return;

            try {
                const profile = await api('/api/profile', { method: 'GET' });

                setUserData({
                    name: profile.name,
                    role: profile.role,
                    location: profile.location
                });

                const parseJsonField = (field) => {
                    if (!field) return [];
                    if (typeof field === 'string') {
                        try { return JSON.parse(field); } catch { return []; }
                    }
                    if (Array.isArray(field)) return field;
                    return [];
                };

                setProfileData({
                    about: profile.about || "",
                    experiences: parseJsonField(profile.experiences),
                    education: parseJsonField(profile.education),
                    skills: parseJsonField(profile.skills),
                    courses: parseJsonField(profile.courses),
                });

                setHasLoadedProfile(true);

            } catch (error) {
                console.error("❌ Erro ao carregar perfil:", error);
                setHasLoadedProfile(true);
            }
        };

        loadProfileData();
    }, [user?.id, hasLoadedProfile]);

    // ✅ Upload de imagem -> usa PATCH /banner
    const handleBannerUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Formato de arquivo não suportado. Use JPEG, PNG ou GIF.');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Arquivo muito grande. Máximo: 5MB.');
            return;
        }

        try {
            setIsUploadingImage(true);
            const imageUrl = await uploadImage(file, 'banners'); // ✅ NOVO

            // Salvar URL no localStorage
            const updatedUser = { ...user, banner_image: imageUrl };
            await updateUser(updatedUser);

            // Salvar URL no backend
            try {
                await patchProfile("/banner", {
                    banner_image: imageUrl,
                });
                console.log("✅ PATCH /banner bem-sucedido");
            } catch (backendError) {
                console.warn("⚠️ Backend falhou:", backendError);
            }

            toast.success("Banner atualizado!");
        } catch (error) {
            console.error("❌ Erro ao fazer upload:", error);
            toast.error("Erro ao atualizar banner. Tente novamente.");
        } finally {
            setIsUploadingImage(false);
        }
    };

    // FOTO DE PERFIL
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Formato de arquivo não suportado. Use JPEG, PNG ou GIF.');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Arquivo muito grande. Máximo: 5MB.');
            return;
        }

        try {
            setIsUploadingImage(true);

            // Upload direto pro Cloudinary

            const imageUrl = await uploadImage(file, 'profile_image');

            // Salvar URL no localStorage
            const updatedUser = { ...user, profile_image: imageUrl };
            await updateUser(updatedUser);

            // Salvar URL no backend
            await patchProfile("/profile-image", {
                profile_image: imageUrl,
            });

            toast.success("Foto de perfil atualizada!");
        } catch (error) {
            console.error("❌ Erro ao fazer upload:", error);
            toast.error("Erro ao atualizar foto. Tente novamente.");
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

            toast.success("Foto de perfil removida!");
        } catch (error) {
            console.error("❌ Erro ao deletar foto:", error);
            toast.error("Erro ao remover foto.");
        }
    };

    // ✅ Atualizar SOBRE -> PATCH /about
    const handleUpdateAbout = async (data) => {
        try {
            ("📝 Iniciando atualização de about com dados:", data.about);

            // 1. Atualizar o estado local imediatamente (otimista)
            setProfileData(prev => ({ ...prev, about: data.about }));

            // 2. Sincronizar com o context do usuário PRIMEIRO (isso salva no localStorage)
            const updatedUser = { ...user, about: data.about };
            ("📝 Salvando user com about no localStorage");
            await updateUser(updatedUser);

            // 3. Fazer a requisição ao backend (tenta persistir no BD)
            try {
                await patchProfile("/about", { about: data.about });
                ("✅ PATCH /about bem-sucedido");
            } catch (backendError) {
                console.warn("⚠️ Backend falhou, mas dados estão salvos localmente:", backendError);
            }

            ("✅ Usuário context atualizado com about:", updatedUser.about);

        } catch (error) {
            console.error("❌ Erro ao atualizar sobre:", error);
            // Reverter o estado local em caso de erro
            setProfileData(prev => ({ ...prev, about: user?.about || "" }));

        }
    };

    // ✅ Atualizar EXPERIÊNCIAS -> PATCH /experiences
    const handleUpdateExperiences = async (experiences) => {
        try {
            ('💼 Atualizando com', experiences.length, 'experiências');

            // ✅ Atualiza estado local PRIMEIRO
            setProfileData(prev => ({ ...prev, experiences }));

            const updatedUser = { ...user, experiences };
            await updateUser(updatedUser);

            try {
                await patchProfile("/experiences", { experiences });
                ("✅ PATCH /experiences bem-sucedido");
            } catch (backendError) {
                console.warn("⚠️ Backend falhou:", backendError);
            }

        } catch (error) {
            console.error("❌ Erro:", error);
            // Reverte em caso de erro
            setProfileData(prev => ({ ...prev, experiences: user?.experiences || [] }));
        }
    };

    // ✅ Atualizar EDUCAÇÃO -> PATCH /education
    const handleUpdateEducation = async (education) => {
        try {
            ("🎓 Iniciando atualização de educação com", education.length, "items");

            // 1. Atualizar o estado local imediatamente (otimista)
            setProfileData(prev => ({ ...prev, education }));

            // 2. Sincronizar com o context do usuário PRIMEIRO (isso salva no localStorage)
            const updatedUser = { ...user, education };
            ("🎓 Salvando user com educação no localStorage");
            await updateUser(updatedUser);

            // 3. Fazer a requisição ao backend (tenta persistir no BD)
            try {
                await patchProfile("/education", { education });
                ("✅ PATCH /education bem-sucedido");
            } catch (backendError) {
                console.warn("⚠️ Backend falhou, mas dados estão salvos localmente:", backendError);
            }

            ("✅ Usuário context atualizado");
        } catch (error) {
            console.error("❌ Erro ao atualizar formação:", error);
            // Reverter o estado local em caso de erro
            setProfileData(prev => ({ ...prev, education: user?.education || [] }));

        }
    };

    // ✅ Atualizar SKILLS -> PATCH /skills
    const handleUpdateSkills = async (skills) => {
        try {
            ("⚡ Iniciando atualização de skills com", skills.length, "items");

            // 1. Atualizar o estado local imediatamente (otimista)
            setProfileData(prev => ({ ...prev, skills }));

            // 2. Sincronizar com o context do usuário PRIMEIRO (isso salva no localStorage)
            const updatedUser = { ...user, skills };
            ("⚡ Salvando user com skills no localStorage");
            await updateUser(updatedUser);

            // 3. Fazer a requisição ao backend (tenta persistir no BD)
            try {
                await patchProfile("/skills", { skills });
                ("✅ PATCH /skills bem-sucedido");
            } catch (backendError) {
                console.warn("⚠️ Backend falhou, mas dados estão salvos localmente:", backendError);
            }

            ("✅ Usuário context atualizado");

        } catch (error) {
            console.error("❌ Erro ao atualizar habilidades:", error);
            // Reverter o estado local em caso de erro
            setProfileData(prev => ({ ...prev, skills: user?.skills || [] }));

        }
    };

    const handleUpdateCourses = async (courses) => {
        try {
            console.log("📚 Iniciando atualização de cursos com", courses.length, "items");

            // 1. Atualizar o estado local imediatamente (otimista)
            setProfileData(prev => ({ ...prev, courses }));

            // 2. Sincronizar com o context do usuário PRIMEIRO (isso salva no localStorage)
            const updatedUser = { ...user, courses };
            console.log("📚 Salvando user com cursos no localStorage");
            await updateUser(updatedUser);
            // 3. Fazer a requisição ao backend (tenta persistir no BD)
            try {
                await patchProfile("/courses", { courses });
                console.log("✅ PATCH /courses bem-sucedido");
            } catch (backendError) {
                console.warn("⚠️ Backend falhou, mas dados estão salvos localmente:", backendError);
            }
            console.log("✅ Usuário context atualizado");
        } catch (error) {
            console.error("❌ Erro ao atualizar cursos:", error);
            // Reverter o estado local em caso de erro
            setProfileData(prev => ({ ...prev, courses: user?.courses || [] }));
        }
    };

    // ✅ Atualizar PERFIL (nome + profissão)
    const handleUpdateProfile = async (data) => {
        try {
            setUserData({ name: data.name, role: data.role, location: data.location });

            await patchProfile("/basic-info", {
                name: data.name,
                role: data.role,
                location: data.location
            });

            toast.success("Perfil atualizado!");
        } catch (error) {
            console.error("❌ Erro ao atualizar perfil:", error);
            toast.error("Erro ao atualizar perfil");
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
                            onUpdateUser={handleUpdateProfile}
                            onImageUpload={handleImageUpload}
                            onDeleteImage={handleDeleteImage}
                            isUploadingImage={isUploadingImage}
                            onBannerUpload={handleBannerUpload}        // ← Banner
                            onProfileImageUpload={handleImageUpload}
                        />

                        <ProfileAbout about={profileData.about} onUpdate={handleUpdateAbout} />


                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Atividade</h2>
                            <p className="text-gray-600 text-sm md:text-base">Ainda não há atividades para mostrar</p>
                        </div>

                        <ProfileExperience experiences={profileData.experiences} onUpdate={handleUpdateExperiences} />

                        <ProfileCousers cousers={profileData.courses} onUpdate={handleUpdateCourses} />

                        <ProfileEducation education={profileData.education} onUpdate={handleUpdateEducation} />

                        <ProfileSkills skills={profileData.skills} onUpdate={handleUpdateSkills} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
