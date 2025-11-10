import { useState, useEffect } from "react";
import { Zap, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ProfileSkills = ({ skills = [], onUpdate }) => {
    const [skillsList, setSkillsList] = useState(skills);
    const [isAdding, setIsAdding] = useState(false);
    const [newSkill, setNewSkill] = useState("");

    // Sincronizar quando o prop 'skills' mudar
    useEffect(() => {
        setSkillsList(skills);
    }, [skills]);

    const handleAddSkill = () => {
        if (newSkill.trim()) {
            const newSkills = [...skillsList, { id: Date.now(), name: newSkill.trim(), endorsements: 0 }];
            setSkillsList(newSkills);
            onUpdate(newSkills);
            setNewSkill("");
            setIsAdding(false);
        }
    };

    const handleRemoveSkill = (id) => {
        const newSkills = skillsList.filter(skill => skill.id !== id);
        setSkillsList(newSkills);
        onUpdate(newSkills);
    };

    return (
        <Card className="bg-white border-gray-200 rounded-xl hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg md:text-xl font-semibold text-gray-900">
                        Competências
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
            <CardContent>
                {/* Formulário de adicionar */}
                {isAdding && (
                    <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                            placeholder="Ex: Gestão de Vendas, Liderança"
                            className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                            autoFocus
                        />
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                onClick={handleAddSkill}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white text-sm flex-1 sm:flex-none transition-colors"
                            >
                                Adicionar
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setNewSkill("");
                                    setIsAdding(false);
                                }}
                                className="text-sm flex-1 sm:flex-none"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                {/* Lista de habilidades */}
                {skillsList.length === 0 && !isAdding ? (
                    <div className="text-center py-8">
                        <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm md:text-base">Nenhuma competência adicionada</p>
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="mt-4 bg-green-600 hover:bg-green-700 text-white transition-colors"
                        >
                            Adicionar competência
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {skillsList.map((skill) => (
                            <div
                                key={skill.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 text-sm md:text-base truncate">{skill.name}</p>
                                        {skill.endorsements > 0 && (
                                            <p className="text-xs md:text-sm text-gray-600">
                                                {skill.endorsements} {skill.endorsements === 1 ? 'recomendação' : 'recomendações'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSkill(skill.id)}
                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {skillsList.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            className="w-full text-sm md:text-base"
                            onClick={() => setIsAdding(true)}
                        >
                            Mostrar todas as competências ({skillsList.length})
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfileSkills;