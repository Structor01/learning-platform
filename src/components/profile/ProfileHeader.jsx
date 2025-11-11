import { useState, useEffect } from "react";
import { Camera, MapPin, Briefcase, Edit2, X, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ProfileHeader = ({ user, onUpdateUser, onImageUpload, onBannerUpload, isUploadingImage, onDeleteImage }) => {

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
            {/* Banner */}
            <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-green-600 to-green-500">
                {user?.banner_image && (
                    <img
                        src={user.banner_image}
                        alt="Banner"
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Botão editar banner */}
                <label
                    htmlFor="banner-upload"
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white hover:bg-gray-50 p-2 rounded-full cursor-pointer shadow-lg transition-colors"
                    title="Atualizar banner"
                >
                    <Camera className="w-4 h-4 text-gray-700" />
                </label>
                <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    onChange={onBannerUpload}
                    className="hidden"
                />
            </div>

            {/* Área de informações */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                {/* Avatar */}
                <div className="relative -mt-12 sm:-mt-14 md:-mt-16 mb-4">
                    <div className="relative inline-block">
                        <Avatar className="w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 border-4 border-white shadow-lg">
                            <AvatarImage
                                src={user?.profile_image || user?.userLegacy?.image}
                                alt={user?.name}
                            />
                            <AvatarFallback className="bg-green-600 text-white text-xl sm:text-2xl md:text-3xl">
                                {user?.name?.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>

                        {/* Botão editar foto */}
                        <label
                            htmlFor="profile-image-upload"
                            className="absolute bottom-0 right-0 w-8 sm:w-10 h-8 sm:h-10 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors"
                            title="Atualizar foto de perfil"
                        >
                            {isUploadingImage ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Camera className="w-3 sm:w-4 h-3 sm:h-4 text-gray-700" />
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
                        {user?.banner_image && (
                            <button
                                onClick={onDeleteImage}
                            >
                                <X className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Informações do usuário */}
                <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        {user?.name || "Nome do Usuário"}
                    </h1>

                    {/* <p className="text-base sm:text-lg text-gray-700">
                        {user?.role || "Cargo na Empresa"}
                    </p> */}

                    {/* <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{user?.location || "Localização"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{user?.company || "Empresa"}</span>
                        </div>
                    </div> */}
                </div>

                {/* Botões de ação
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-6">
                    <Button className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base flex-1 sm:flex-none transition-colors">
                        Aberto a trabalho
                    </Button>
                    <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 text-sm sm:text-base flex-1 sm:flex-none transition-colors">
                        Adicionar seção
                    </Button>
                    <Button variant="outline" className="text-sm sm:text-base flex-1 sm:flex-none transition-colors">
                        Mais
                    </Button>
                </div> */}
            </div>
        </div>
    );
};

export default ProfileHeader;