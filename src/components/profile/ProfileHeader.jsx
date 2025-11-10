import { useState, useEffect } from "react";
import { Camera, MapPin, Briefcase, Edit2, X, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ProfileHeader = ({ user, onUpdateUser, onImageUpload, isUploadingImage, onDeleteImage }) => {
    const [isEditingBanner, setIsEditingBanner] = useState(false);
    const [bannerImage, setBannerImage] = useState(user?.banner_image || "");

    // Sincronizar quando a imagem do usuário mudar
    useEffect(() => {
        if (user?.banner_image) {
            setBannerImage(user.banner_image);
        }
    }, [user?.banner_image]);

    const handleBannerUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Lógica de upload do banner (similar à foto de perfil)
            const reader = new FileReader();
            reader.onload = (e) => {
                setBannerImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = () => {
        if (onDeleteImage) {
            onDeleteImage();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            {/* Banner */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-blue-400">
                {bannerImage && (
                    <img
                        src={bannerImage}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Botão editar banner */}
                <label
                    htmlFor="banner-upload"
                    className="absolute top-4 right-4 bg-white hover:bg-gray-100 p-2 rounded-full cursor-pointer shadow-lg transition-colors"
                >
                    <Camera className="w-4 h-4 text-gray-700" />
                </label>
                <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                />
            </div>

            {/* Área de informações */}
            <div className="px-6 pb-6">
                {/* Avatar */}
                <div className="relative -mt-16 mb-4">
                    <div className="relative inline-block">
                        <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                            <AvatarImage
                                src={user?.profile_image || user?.userLegacy?.image}
                                alt={user?.name}
                            />
                            <AvatarFallback className="bg-blue-600 text-white text-3xl">
                                {user?.name?.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>

                        {/* Botão editar foto */}
                        <label
                            htmlFor="profile-image-upload"
                            className="absolute bottom-0 right-0 w-10 h-10 bg-white hover:bg-gray-100 border-2 border-gray-200 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors"
                        >
                            {isUploadingImage ? (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Camera className="w-4 h-4 text-gray-700" />
                            )}
                        </label>
                        <input
                            id="profile-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={onImageUpload}
                            className="hidden"
                            disabled={isUploadingImage}
                        />

                        {/* Botão deletar foto */}
                        {bannerImage && (
                            <button
                                onClick={handleDeleteImage}
                                className="absolute bottom-0 left-0 w-10 h-10 bg-red-500 hover:bg-red-600 border-2 border-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors"
                                title="Deletar foto de perfil"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Informações do usuário */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {user?.name || "Nome do Usuário"}
                    </h1>

                    <p className="text-lg text-gray-700">
                        {user?.role || "Cargo na Empresa"}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{user?.location || "Localização"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{user?.company || "Empresa"}</span>
                        </div>
                    </div>

                    {/* Conexões e seguidores */}
                    <div className="flex items-center gap-4 text-sm pt-2">
                        <button className="text-blue-600 hover:underline font-semibold">
                            500+ conexões
                        </button>
                        <span className="text-gray-600">•</span>
                        <button className="text-blue-600 hover:underline">
                            120 seguidores
                        </button>
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-3 mt-6">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Aberto a trabalho
                    </Button>
                    <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                        Adicionar seção
                    </Button>
                    <Button variant="outline">
                        Mais
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;