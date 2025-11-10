import { useState, useEffect } from "react";
import { Briefcase, Plus, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProfileExperience = ({ experiences = [], onUpdate }) => {
    const [experiencesList, setExperiencesList] = useState(experiences);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        employmentType: "",
        location: "",
        start: "",
        end: "",
        description: "",
    });

    useEffect(() => {
        setExperiencesList(experiences);
    }, [experiences]);

    // FUNÇÃO PARA CONVERTER ARRAY EM TEXTO
    const convertToText = (expArray) => {
        return expArray
            .map(exp => {
                const lines = [
                    `Cargo: ${exp.title}`,
                    `Empresa: ${exp.company}`,
                    exp.employmentType && `Tipo: ${exp.employmentType}`,
                    exp.location && `Local: ${exp.location}`,
                    `Período: ${exp.startDate} - ${exp.currentlyWorking ? 'Atual' : exp.endDate}`,
                    exp.description && `Descrição: ${exp.description}`
                ].filter(Boolean);
                return lines.join('\n');
            })
            .join('\n\n---\n\n');
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

        console.log("🔥 ProfileExperience - updated:", updated);
        console.log("🔥 ProfileExperience - updated JSON:", JSON.stringify(updated));
        setExperiencesList(updated);
        onUpdate(updated); // ← SEM convertToText
        resetForm();
    };

    const handleDelete = (id) => {
        const updated = experiencesList.filter(exp => exp.id !== id);
        setExperiencesList(updated);
        onUpdate(updated); // ← SEM convertToText
    };

    const resetForm = () => {
        setFormData({
            title: "",
            company: "",
            employmentType: "",
            location: "",
            start: "",
            end: "",
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
                    experiencesList.map((exp) => (
                        <div key={exp.id} className="flex gap-3 md:gap-4 pb-4 md:pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                            <div className="flex-shrink-0">
                                <div className="w-10 md:w-12 h-10 md:h-12 bg-green-50 rounded flex items-center justify-center">
                                    <Briefcase className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                                            {exp.title}
                                        </h3>
                                        <p className="text-sm md:text-base text-gray-700 truncate">{exp.company}</p>
                                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                                            {new Date(exp.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} - {' '}
                                            {exp.currentlyWorking ? 'Presente' : new Date(exp.endDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                                            {' • '}
                                            {calculateDuration(exp.startDate, exp.endDate, exp.currentlyWorking)}
                                        </p>
                                        {exp.location && (
                                            <p className="text-xs md:text-sm text-gray-600 truncate">{exp.location}</p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setFormData(exp);
                                                setEditingId(exp.id);
                                            }}
                                            className="text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(exp.id)}
                                            className="text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {exp.description && (
                                    <p className="mt-3 text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {exp.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default ProfileExperience;