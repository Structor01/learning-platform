import { useState, useEffect } from "react";
import { GraduationCap, Plus, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProfileEducation = ({ education = [], onUpdate }) => {
    const [educationList, setEducationList] = useState(education);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        grade: "",
        activities: "",
        description: "",
    });

    // Sincronizar quando o prop 'education' mudar
    useEffect(() => {
        setEducationList(education);
    }, [education]);

    const handleSubmit = () => {
        if (editingId) {
            const updated = educationList.map(edu =>
                edu.id === editingId ? { ...formData, id: editingId } : edu
            );
            setEducationList(updated);
            onUpdate(updated);
        } else {
            const newEducation = [...educationList, { ...formData, id: Date.now() }];
            setEducationList(newEducation);
            onUpdate(newEducation);
        }
        resetForm();
    };

    const handleDelete = (id) => {
        const updated = educationList.filter(edu => edu.id !== id);
        setEducationList(updated);
        onUpdate(updated);
    };

    const resetForm = () => {
        setFormData({
            school: "",
            degree: "",
            field: "",
            startDate: "",
            endDate: "",
            grade: "",
            activities: "",
            description: "",
        });
        setIsAdding(false);
        setEditingId(null);
    };

    return (
        <Card className="bg-white border-gray-200">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                        Formação acadêmica
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        className="text-gray-600 hover:bg-gray-100"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Formulário */}
                {(isAdding || editingId) && (
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Instituição *
                            </label>
                            <input
                                type="text"
                                value={formData.school}
                                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                placeholder="Ex: Universidade de São Paulo"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Grau *
                            </label>
                            <input
                                type="text"
                                value={formData.degree}
                                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                placeholder="Ex: Bacharelado, Mestrado, MBA"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Área de estudo *
                            </label>
                            <input
                                type="text"
                                value={formData.field}
                                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                                placeholder="Ex: Administração de Empresas"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de início
                                </label>
                                <input
                                    type="month"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de término (ou prevista)
                                </label>
                                <input
                                    type="month"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nota ou média (opcional)
                            </label>
                            <input
                                type="text"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                placeholder="Ex: 9.5"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Atividades e grupos (opcional)
                            </label>
                            <input
                                type="text"
                                value={formData.activities}
                                onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                                placeholder="Ex: Atlética, Centro Acadêmico"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição (opcional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva sua experiência acadêmica..."
                                className="w-full min-h-[80px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleSubmit}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {editingId ? "Salvar" : "Adicionar"}
                            </Button>
                            <Button variant="outline" onClick={resetForm}>
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                {/* Lista de formações */}
                {educationList.length === 0 && !isAdding ? (
                    <div className="text-center py-8">
                        <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Nenhuma formação adicionada</p>
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Adicionar formação
                        </Button>
                    </div>
                ) : (
                    educationList.map((edu) => (
                        <div key={edu.id} className="flex gap-4 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                    <GraduationCap className="w-6 h-6 text-gray-600" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {edu.school}
                                        </h3>
                                        <p className="text-gray-700">
                                            {edu.degree} em {edu.field}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {edu.startDate && new Date(edu.startDate).toLocaleDateString('pt-BR', { year: 'numeric' })}
                                            {edu.startDate && edu.endDate && ' - '}
                                            {edu.endDate && new Date(edu.endDate).toLocaleDateString('pt-BR', { year: 'numeric' })}
                                        </p>
                                        {edu.grade && (
                                            <p className="text-sm text-gray-600">Nota: {edu.grade}</p>
                                        )}
                                        {edu.activities && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">Atividades:</span> {edu.activities}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setFormData(edu);
                                                setEditingId(edu.id);
                                            }}
                                            className="text-gray-600 hover:bg-gray-100"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(edu.id)}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {edu.description && (
                                    <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {edu.description}
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

export default ProfileEducation;