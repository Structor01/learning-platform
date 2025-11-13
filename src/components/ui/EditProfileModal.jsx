import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EditProfileModal = ({ isOpen, onClose, user, onUpdateUser }) => {
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        location: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    // Preenche os campos quando o modal abre
    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                name: user.name || "",
                role: user.role || "",
                location: user.location || ""
            });
        }
    }, [isOpen, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await onUpdateUser(formData);
            onClose();
        } catch (error) {
            console.error("Erro ao atualizar:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Editar perfil</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Seu nome completo"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Profissão</Label>
                        <Input
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            placeholder="Ex: Desenvolvedor Frontend"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Cidade</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="São Paulo, SP"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                            {isLoading ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileModal;