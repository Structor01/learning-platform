// src/components/ui/TodasCandidaturasPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    Briefcase,
    MapPin,
    Clock,
    Building2,
    Calendar,
    Eye,
    CheckCircle,
    XCircle,
    Hourglass,
    FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "../utils/api";
import Navbar from "./Navbar";

const CandidaturasAdmPage = () => {
    const [candidaturas, setCandidaturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { accessToken, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            fetchTodasCandidaturas();
        }
    }, [isAuthenticated, isLoading]);

    const fetchTodasCandidaturas = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/candidaturas`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setCandidaturas(response.data);
        } catch (err) {
            console.error("Erro ao buscar todas as candidaturas:", err);
            setError("Erro ao carregar candidaturas. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const buscarEmpresa = async (candidatura) => {
        try {
            const vagaResponse = await axios.get(`${API_URL}/api/vagas/${candidatura.vaga_id}`);
            const empresaId = vagaResponse.data.company_id;
            if (empresaId) {
                navigate(`/empresa/${empresaId}`);
            } else {
                alert("Empresa não encontrada.");
            }
        } catch (error) {
            console.error("Erro ao buscar empresa:", error);
            alert("Erro ao buscar empresa.");
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "aprovado":
            case "aprovada":
                return "bg-green-100 text-green-800 border-green-200";
            case "reprovado":
            case "reprovada":
                return "bg-red-100 text-red-800 border-red-200";
            case "em_analise":
            case "pendente":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-blue-100 text-blue-800 border-blue-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "aprovado":
            case "aprovada":
                return <CheckCircle className="w-4 h-4" />;
            case "reprovado":
            case "reprovada":
                return <XCircle className="w-4 h-4" />;
            case "em_analise":
            case "pendente":
                return <Hourglass className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Data não disponível";
        try {
            return new Date(dateString).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            return "Data inválida";
        }
    };

    return (
        <div className="min-h-screen bg-black">
            <Navbar currentView="todasCandidaturas" />
            <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-white mb-6">
                    Todas as Candidaturas
                </h1>

                {loading ? (
                    <p className="text-white">Carregando...</p>
                ) : error ? (
                    <p className="text-red-400">{error}</p>
                ) : (
                    <div className="grid gap-6">
                        {candidaturas.map((candidatura) => (
                            <div
                                key={candidatura.id}
                                className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            {candidatura.vaga?.nome || "Vaga não especificada"}
                                        </h2>
                                        <p className="text-orange-400">
                                            {candidatura.vaga?.empresa || "Empresa não informada"}
                                        </p>
                                        <div className="flex flex-wrap gap-4 mt-2 text-gray-400 text-sm">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {candidatura.vaga?.cidade}, {candidatura.vaga?.uf}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {candidatura.vaga?.modalidade}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm flex flex-col items-end gap-2">
                                        <div
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full border font-medium ${getStatusColor(
                                                candidatura.status
                                            )}`}
                                        >
                                            {getStatusIcon(candidatura.status)}
                                            <span>{candidatura.status?.replace("_", " ")}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(candidatura.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between text-sm text-gray-500">
                                    <span>ID Candidatura: #{candidatura.id}</span>
                                    <button
                                        onClick={() => buscarEmpresa(candidatura)}
                                        className="text-orange-400 hover:underline flex items-center gap-1"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Ver empresa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidaturasAdmPage;
