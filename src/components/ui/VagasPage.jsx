// src/components/ui/VagasPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, Briefcase, Users, Globe, ChevronRight } from 'lucide-react';
import { API_URL } from '../utils/api';
import Navbar from './Navbar';

const VagasPage = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const navigate = useNavigate();

    // Buscar empresas da API
    useEffect(() => {
        axios.get(`${API_URL}/api/companies`)
            .then(res => {
                setCompanies(res.data);
                setFilteredCompanies(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erro ao buscar empresas:', err);
                setLoading(false);
            });
    }, []);

    // Função para filtrar empresas (será chamada pelo Navbar)
    const handleSearch = (searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredCompanies(companies);
        } else {
            const filtered = companies.filter(company =>
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (company.corporate_name && company.corporate_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (company.obs && company.obs.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredCompanies(filtered);
        }
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Navbar Fixo */}
            <Navbar
                currentView="vagas"
                onViewChange={(view) => console.log('View changed:', view)}
                onAddTrilha={() => console.log('Add trilha')}
                onSearch={handleSearch}
            />

            {/* Main Content - com margin-top para compensar navbar fixo */}
            <main className="pt-16">
                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
                        {/* Header Text */}
                        <div className="text-center mb-8 sm:mb-12">
                            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                                Descubra Sua Próxima
                                <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
                                    Oportunidade Profissional
                                </span>
                            </h1>
                            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                Conecte-se com empresas inovadoras e encontre oportunidades que impulsionarão
                                sua carreira no agronegócio e tecnologia.
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                            <div className="bg-gray-900/80 backdrop-blur border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border shadow-lg">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                                    {companies.length}+
                                </h3>
                                <p className="text-sm sm:text-base text-gray-400">Empresas Parceiras</p>
                            </div>

                            <div className="bg-gray-900/80 backdrop-blur border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border shadow-lg">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                                    {companies.reduce((acc, company) => acc + (company.jobCount || 0), 0) || '50'}+
                                </h3>
                                <p className="text-sm sm:text-base text-gray-400">Vagas Disponíveis</p>
                            </div>

                            <div className="bg-gray-900/80 backdrop-blur border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border shadow-lg sm:col-span-2 lg:col-span-1">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">500+</h3>
                                <p className="text-sm sm:text-base text-gray-400">Profissionais Conectados</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Companies Section */}
                <section className="pb-8 sm:pb-12 lg:pb-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-12 sm:py-20">
                                <div className="relative mx-auto mb-6 sm:mb-8 w-12 h-12 sm:w-16 sm:h-16">
                                    <div className="w-full h-full border-4 border-gray-700 border-t-orange-600 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 w-full h-full border-4 border-transparent border-t-red-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Carregando oportunidades</h3>
                                <p className="text-sm sm:text-base text-gray-400">Buscando as melhores empresas para você...</p>
                            </div>
                        )}

                        {/* Companies Grid */}
                        {!loading && filteredCompanies.length > 0 && (
                            <>
                                <div className="mb-6 sm:mb-8">
                                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                        {filteredCompanies.length === companies.length
                                            ? `${companies.length} Empresas Disponíveis`
                                            : `${filteredCompanies.length} Resultados Encontrados`
                                        }
                                    </h2>
                                    <p className="text-sm sm:text-base text-gray-400">
                                        Explore as oportunidades e encontre sua próxima carreira
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                                    {filteredCompanies.map(company => (
                                        <article
                                            key={company.id}
                                            className="group bg-gray-900/80 backdrop-blur border-gray-800 rounded-2xl sm:rounded-3xl shadow-lg hover:bg-gray-800/80 transition-all duration-500 cursor-pointer border hover:border-gray-700 hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden"
                                            onClick={() => navigate(`/empresa/${company.id}`)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    navigate(`/empresa/${company.id}`);
                                                }
                                            }}
                                        >
                                            {/* Header with gradient */}
                                            <header className="bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6 text-white relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16"></div>
                                                <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12"></div>

                                                <div className="relative z-10">
                                                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                                                        <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-white/90 flex-shrink-0" />
                                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                    </div>

                                                    <h3 className="text-lg sm:text-xl font-bold mb-2 leading-tight line-clamp-2">
                                                        {company.name}
                                                    </h3>

                                                    <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                                                        <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                        <span>Agronegócio</span>
                                                    </div>
                                                </div>
                                            </header>

                                            {/* Content */}
                                            <div className="p-4 sm:p-6">
                                                {company.corporate_name && (
                                                    <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 font-medium line-clamp-1">
                                                        {company.corporate_name}
                                                    </p>
                                                )}

                                                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                                                    {company.obs || 'Empresa focada em soluções inovadoras para o agronegócio com tecnologia de ponta e sustentabilidade.'}
                                                </p>

                                                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                                                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                                                        <span>Brasil</span>
                                                    </div>
                                                    {company.responsible && (
                                                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
                                                            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                                            <span className="line-clamp-1">Responsável: {company.responsible}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* CTA Footer */}
                                                <footer className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-800">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                        <span className="text-xs text-gray-500 font-medium">Contratando</span>
                                                    </div>

                                                    <div className="flex items-center gap-1 sm:gap-2 text-orange-500 font-semibold group-hover:text-orange-400 transition-colors">
                                                        <span className="text-xs sm:text-sm">Ver vagas</span>
                                                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 sm:group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </footer>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Empty State */}
                        {!loading && companies.length === 0 && (
                            <div className="text-center py-12 sm:py-20">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                                    Nenhuma empresa encontrada
                                </h3>
                                <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto mb-6 sm:mb-8 px-4">
                                    Não encontramos empresas disponíveis no momento. Tente novamente em alguns instantes.
                                </p>
                            </div>
                        )}

                        {/* No Search Results */}
                        {!loading && filteredCompanies.length === 0 && companies.length > 0 && (
                            <div className="text-center py-12 sm:py-20">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <Search className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                                    Nenhum resultado encontrado
                                </h3>
                                <p className="text-sm sm:text-base text-gray-400 max-w-md mx-auto mb-6 sm:mb-8 px-4">
                                    Não encontramos empresas que correspondam à sua busca. Tente outros termos.
                                </p>
                                <button
                                    onClick={() => {
                                        setFilteredCompanies(companies);
                                        // Limpar busca no navbar também
                                    }}
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base"
                                >
                                    Ver todas as empresas
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default VagasPage;