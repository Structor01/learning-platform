import { useState, useEffect } from "react";
import { Briefcase, Plus, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ProfileExperience = ({ experiences = [], onUpdate }) => {
    const [experiencesList, setExperiencesList] = useState(experiences);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        employmentType: "",
        location: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        description: "",
    });

    useEffect(() => {
        // ✅ Garante que cada experiência tem um ID
        const withIds = experiences.map(exp => ({
            ...exp,
            id: exp.id || Date.now() + Math.random() // Gera ID se não existir
        }));
        setExperiencesList(withIds);
    }, [experiences]);

    // ✅ NOVA FUNÇÃO: Agrupa experiências por empresa
    const groupByCompany = (experiences) => {
        const grouped = {};

        experiences.forEach(exp => {
            if (!grouped[exp.company]) {
                grouped[exp.company] = {
                    company: exp.company,
                    positions: []
                };
            }
            grouped[exp.company].positions.push(exp);
        });

        // Ordena posições por data (mais recente primeiro)
        Object.values(grouped).forEach(company => {
            company.positions.sort((a, b) => {
                const dateA = new Date(a.startDate);
                const dateB = new Date(b.startDate);
                return dateB - dateA;
            });
        });

        return Object.values(grouped);
    };

    const handleSubmit = () => {
        let updated;
        if (editingId) {
            updated = experiencesList.map(exp =>
                exp.id === editingId ? { ...formData, id: editingId } : exp
            );
        } else {
            updated = [...experiencesList, { ...formData, id: Date.now() }];
        }

        setExperiencesList(updated);
        onUpdate(updated);
        resetForm();
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        const updated = experiencesList.filter(exp => exp.id !== deleteId);
        setExperiencesList(updated);
        await onUpdate(updated);
        setDeleteId(null); // ✅ Fecha o modal
    };
    const resetForm = () => {
        setFormData({
            title: "",
            company: "",
            employmentType: "",
            location: "",
            startDate: "",
            endDate: "",
            currentlyWorking: false,
            description: "",
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const calculateDuration = (start, end, current) => {
        if (!start) return "";

        const startDate = new Date(start);
        const endDate = current ? new Date() : new Date(end);

        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
            (endDate.getMonth() - startDate.getMonth());

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (years > 0 && remainingMonths > 0) {
            return `${years} ano${years > 1 ? 's' : ''} e ${remainingMonths} ${remainingMonths > 1 ? 'meses' : 'mês'}`;
        } else if (years > 0) {
            return `${years} ano${years > 1 ? 's' : ''}`;
        } else {
            return `${remainingMonths} ${remainingMonths > 1 ? 'meses' : 'mês'}`;
        }
    };

    // ✅ Calcula duração total na empresa
    const calculateCompanyDuration = (positions) => {
        if (!positions.length) return "";

        const sortedPositions = [...positions].sort((a, b) =>
            new Date(a.startDate) - new Date(b.startDate)
        );

        const firstStart = sortedPositions[0].startDate;
        const hasCurrentPosition = positions.some(p => p.currentlyWorking);
        const lastEnd = hasCurrentPosition ? null :
            sortedPositions.reduce((latest, pos) => {
                const endDate = new Date(pos.endDate);
                return endDate > new Date(latest) ? pos.endDate : latest;
            }, sortedPositions[0].endDate);

        return calculateDuration(firstStart, lastEnd, hasCurrentPosition);
    };

    const groupedExperiences = groupByCompany(experiencesList);

    return (
        <Card className="bg-white border-gray-200 rounded-xl hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg md:text-xl font-semibold text-gray-900">
                        Experiência
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        className="text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                {(isAdding || editingId) && (
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cargo *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Gerente de Vendas"
                                className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Empresa *
                            </label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Ex: AgroSkills"
                                className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de emprego
                                </label>
                                <select
                                    value={formData.employmentType}
                                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                    className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Selecione</option>
                                    <option value="full-time">Tempo integral</option>
                                    <option value="part-time">Meio período</option>
                                    <option value="freelance">Freelance</option>
                                    <option value="internship">Estágio</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Localização
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Ex: São Paulo, SP"
                                    className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="currently-working"
                                checked={formData.currentlyWorking}
                                onChange={(e) => setFormData({ ...formData, currentlyWorking: e.target.checked })}
                                className="w-4 h-4 text-green-600"
                            />
                            <label htmlFor="currently-working" className="text-sm text-gray-700">
                                Trabalho aqui atualmente
                            </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de início *
                                </label>
                                <input
                                    type="month"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            {!formData.currentlyWorking && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data de término
                                    </label>
                                    <input
                                        type="month"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva suas responsabilidades e conquistas..."
                                className="w-full min-h-[80px] md:min-h-[100px] p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                            />
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            <Button
                                onClick={handleSubmit}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base flex-1 sm:flex-none transition-colors"
                            >
                                {editingId ? "Salvar" : "Adicionar"}
                            </Button>
                            <Button variant="outline" onClick={resetForm} className="text-sm md:text-base flex-1 sm:flex-none">
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                {experiencesList.length === 0 && !isAdding ? (
                    <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm md:text-base">Nenhuma experiência adicionada</p>
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="mt-4 bg-green-600 hover:bg-green-700 text-white transition-colors"
                        >
                            Adicionar experiência
                        </Button>
                    </div>
                ) : (
                    groupedExperiences.map((companyGroup) => (
                        <div key={companyGroup.company} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                            {/* ✅ HEADER DA EMPRESA */}
                            <div className="flex gap-3 md:gap-4 mb-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 md:w-12 h-10 md:h-12 bg-green-50 rounded flex items-center justify-center">
                                        <Briefcase className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                                        {companyGroup.company}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-600">
                                        {calculateCompanyDuration(companyGroup.positions)}
                                    </p>
                                </div>
                            </div>

                            {/* ✅ POSIÇÕES */}
                            <div className="ml-14 md:ml-16 space-y-4">
                                {companyGroup.positions.map((position) => (
                                    <div key={position.id} className="relative">
                                        {/* Linha conectora */}
                                        {companyGroup.positions.length > 1 && (
                                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 -ml-7" />
                                        )}

                                        {/* Bullet point */}
                                        {companyGroup.positions.length > 1 && (
                                            <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-gray-300 -ml-[29px]" />
                                        )}

                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-base font-semibold text-gray-900">
                                                    {position.title}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {position.employmentType && (
                                                        <span className="capitalize">{position.employmentType.replace('-', ' ')} • </span>
                                                    )}
                                                    {new Date(position.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} - {' '}
                                                    {position.currentlyWorking ? 'o momento' : new Date(position.endDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                                                    {' • '}
                                                    {calculateDuration(position.startDate, position.endDate, position.currentlyWorking)}
                                                </p>
                                                {position.location && (
                                                    <p className="text-sm text-gray-600">{position.location}</p>
                                                )}
                                                {position.description && (
                                                    <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                        {position.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex gap-2 flex-shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setFormData(position);
                                                        setEditingId(position.id);
                                                    }}
                                                    className="text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        console.log("🔍 Clicou para deletar ID:", position.id);
                                                        setDeleteId(position.id);
                                                        console.log("🔍 deleteId setado");
                                                    }}
                                                    className="text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
            {/* Modal de confirmação de delete */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deletar experiência?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. A experiência será removida permanentemente do seu perfil.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Deletar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};

export default ProfileExperience;