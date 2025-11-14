import { useState, useEffect } from "react";
import { BookOpen, Plus, Edit2, Trash2 } from "lucide-react";
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

const ProfileCousers = ({ cousers = [], onUpdate }) => {
    const [couersList, setCouersList] = useState(cousers);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        platform: "",
        instructor: "",
        startDate: "",
        endDate: "",
        certificate: "",
        hours: "",
        description: "",
    });

    // Sincronizar quando o prop 'cousers' mudar
    useEffect(() => {
        setCouersList(cousers);
    }, [cousers]);

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            alert("Por favor, preencha o nome do curso");
            return;
        }

        if (editingId) {
            const updated = couersList.map(course =>
                course.id === editingId ? { ...formData, id: editingId } : course
            );
            setCouersList(updated);
            onUpdate(updated);
        } else {
            const newCourse = { ...formData, id: Date.now() };
            const newCouersList = [...couersList, newCourse];
            setCouersList(newCouersList);
            onUpdate(newCouersList);
        }
        resetForm();
    };

    const handleDeleteConfirm = () => {
        if (deleteId) {
            const updated = couersList.filter(course => course.id !== deleteId);
            setCouersList(updated);
            onUpdate(updated);
            setDeleteId(null);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const handleEdit = (course) => {
        setFormData(course);
        setEditingId(course.id);
        setIsAdding(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            platform: "",
            instructor: "",
            startDate: "",
            endDate: "",
            certificate: "",
            hours: "",
            description: "",
        });
        setIsAdding(false);
        setEditingId(null);
    };

    return (
        <Card className="bg-white border-gray-200 rounded-xl hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg md:text-xl font-semibold text-gray-900">
                        Meus Cursos
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAdding(true)}
                        className="text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                {/* Formulário */}
                {isAdding && (
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome do Curso *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Gestão de Projetos Ágeis"
                                className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Plataforma
                                </label>
                                <input
                                    type="text"
                                    value={formData.platform}
                                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                    placeholder="Ex: Udemy, Coursera, Alura"
                                    className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Instrutor
                                </label>
                                <input
                                    type="text"
                                    value={formData.instructor}
                                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                                    placeholder="Ex: João Silva"
                                    className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Início
                                </label>
                                <input
                                    type="month"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Conclusão
                                </label>
                                <input
                                    type="month"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Horas (opcional)
                                </label>
                                <input
                                    type="number"
                                    value={formData.hours}
                                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                    placeholder="Ex: 40"
                                    className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Link do Certificado (opcional)
                                </label>
                                <input
                                    type="url"
                                    value={formData.certificate}
                                    onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descrição (opcional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva o conteúdo do curso, aprendizados, etc..."
                                className="w-full min-h-[80px] p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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

                {/* Lista de cursos */}
                {couersList.length === 0 && !isAdding ? (
                    <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm md:text-base">Nenhum curso adicionado</p>
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="mt-4 bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer"
                        >
                            Adicionar Curso
                        </Button>
                    </div>
                ) : (
                    couersList.map((course) => (
                        <div key={course.id} className="flex gap-3 md:gap-4 pb-4 md:pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                            <div className="flex-shrink-0">
                                <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-50 rounded flex items-center justify-center">
                                    <BookOpen className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                                            {course.name}
                                        </h3>
                                        {course.platform && (
                                            <p className="text-sm md:text-base text-gray-700">
                                                {course.platform}
                                            </p>
                                        )}
                                        {course.instructor && (
                                            <p className="text-sm md:text-base text-gray-700">
                                                Instrutor: {course.instructor}
                                            </p>
                                        )}
                                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                                            {course.startDate && new Date(course.startDate).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}
                                            {course.startDate && course.endDate && ' - '}
                                            {course.endDate && new Date(course.endDate).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}
                                        </p>
                                        {course.hours && (
                                            <p className="text-xs md:text-sm text-gray-600">
                                                Carga Horária: {course.hours} horas
                                            </p>
                                        )}
                                        {course.certificate && (
                                            <a
                                                href={course.certificate}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs md:text-sm text-blue-600 hover:text-blue-700 mt-1 inline-block"
                                            >
                                                Ver Certificado →
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(course)}
                                            className="text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteClick(course.id)}
                                            className="text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {course.description && (
                                    <p className="mt-3 text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {course.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deletar curso?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O curso será removido permanentemente do seu perfil.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
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

export default ProfileCousers;