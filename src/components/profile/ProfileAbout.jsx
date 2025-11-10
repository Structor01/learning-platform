import { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ProfileAbout = ({ about, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [aboutText, setAboutText] = useState(about || "");

    // Sincronizar quando o prop 'about' mudar
    useEffect(() => {
        setAboutText(about || "");
    }, [about]);

    const handleSave = () => {
        onUpdate({ about: aboutText });
        setIsEditing(false);
    };

    return (
        <Card className="bg-white border-gray-200">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-gray-900">
                        Sobre
                    </CardTitle>
                    {!isEditing && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="text-gray-600 hover:bg-gray-100"
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="space-y-4">
                        <textarea
                            value={aboutText}
                            onChange={(e) => setAboutText(e.target.value)}
                            placeholder="Conte sua história profissional..."
                            className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSave}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Salvar
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setAboutText(about || "");
                                    setIsEditing(false);
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {aboutText || (
                            <p className="text-gray-400 italic">
                                Adicione uma descrição sobre sua experiência profissional e objetivos de carreira...
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProfileAbout;