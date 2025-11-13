import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    Calendar,
    ExternalLink,
    Filter,
    X,
    ChevronLeft,
    ChevronRight,
    Newspaper,
    TrendingUp,
    Clock,
    Tag
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import { API_URL } from '../components/utils/api';
import { useNotification } from '../components/ui/Notification';

const NewsPage = () => {
    const { showNotification, NotificationComponent } = useNotification();

    // Estados principais
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSource, setSelectedSource] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Estados de paginação
    const [currentPage, setCurrentPage] = useState(1);
    const [newsPorPagina] = useState(12);
    const [totalPages, setTotalPages] = useState(1);

    // Fontes disponíveis
    const [sources, setSources] = useState([]);

    // Buscar notícias
    useEffect(() => {
        fetchNews();
    }, [currentPage]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            ('📰 Buscando notícias...');

            const response = await axios.get(`${API_URL}/api/news`, {
                params: {
                    page: currentPage,
                    limit: newsPorPagina
                }
            });

            ('✅ Notícias carregadas:', response.data);

            // A API retorna: { data: [...], total: X, page: Y, totalPages: Z }
            if (response.data.data && Array.isArray(response.data.data)) {
                // Normalizar os campos da API
                const normalizedNews = response.data.data.map(item => ({
                    ...item,
                    titulo: item.titulo || item.summary || 'Sem título',
                    descricao: item.descricao || item.summary || '',
                    imagemUrl: item.imagemUrl || item.apiImage || '',
                    dataPublicacao: item.dataPublicacao || item.dateNews || item.createdAt,
                    fonteSite: item.fonteSite || 'Desconhecida'
                }));

                setNews(normalizedNews);
                setTotalPages(response.data.totalPages || 1);

                // Extrair fontes únicas
                const uniqueSources = [...new Set(normalizedNews.map(item => item.fonteSite).filter(Boolean))];
                setSources(uniqueSources);
            } else if (Array.isArray(response.data)) {
                setNews(response.data);

                const uniqueSources = [...new Set(response.data.map(item => item.fonteSite).filter(Boolean))];
                setSources(uniqueSources);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar notícias:', error);
            showNotification({
                type: 'error',
                title: 'Erro ao carregar notícias',
                message: 'Não foi possível carregar as notícias. Tente novamente.',
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    // Filtrar notícias
    const newsFiltradas = news.filter((item) => {
        const matchSearch = !searchTerm ||
            item.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.descricao?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchSource = !selectedSource || item.fonteSite === selectedSource;

        return matchSearch && matchSource;
    });

    // Cálculos de paginação
    const totalFiltradas = newsFiltradas.length;
    const indiceInicial = 0;
    const indiceFinal = totalFiltradas;
    const newsPaginadas = newsFiltradas.slice(indiceInicial, indiceFinal);

    // Filtrar notícias válidas (remover as que têm dados desconhecidos)
    const noticiasValidas = newsPaginadas.filter(item =>
        item.titulo !== 'Sem título' && item.fonteSite !== 'Desconhecida'
    );

    // Destacar primeira notícia como hero
    const heroNews = noticiasValidas[0];
    const gridNews = noticiasValidas.slice(1);

    // Função para limpar filtros
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSource('');
        setCurrentPage(1);
    };

    // Funções de paginação
    const handlePageChange = (novaPagina) => {
        setCurrentPage(novaPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    // Formatar data
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    // Abrir notícia
    const handleOpenNews = (newsItem) => {
        if (newsItem.link) {
            window.open(newsItem.link, '_blank', 'noopener,noreferrer');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="pt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="text-center">
                            <div className="relative mx-auto mb-8 w-16 h-16">
                                <div className="w-16 h-16 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Carregando notícias
                            </h3>
                            <p className="text-gray-600">
                                Buscando as últimas notícias do agronegócio...
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="pt-16">
                {/* Hero Section */}
                <section className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                                    Notícias do Agronegócio
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Fique por dentro das últimas notícias do agro
                                </p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                                <TrendingUp className="w-5 h-5" />
                                <span className="font-semibold">{totalFiltradas} notícias</span>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Grid de Notícias */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {newsPaginadas.length > 0 ? (
                        <div className="space-y-8">
                            {/* Hero Card - Primeira notícia em destaque */}
                            {heroNews && (
                                <article
                                    onClick={() => handleOpenNews(heroNews)}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300"
                                >
                                    <div className="grid md:grid-cols-2 gap-0">
                                        {/* Imagem */}
                                        <div className="relative h-64 md:h-full overflow-hidden bg-gray-100">
                                            {heroNews.imagemUrl ? (
                                                <img
                                                    src={heroNews.imagemUrl}
                                                    // alt={heroNews.titulo}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/800x450/059669/ffffff?text=Notícia';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-700">
                                                    <Newspaper className="w-20 h-20 text-white opacity-50" />
                                                </div>
                                            )}
                                            {heroNews.fonteSite && heroNews.fonteSite !== 'Desconhecida' && (
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                                                        Destaque
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Conteúdo */}
                                        <div className="p-6 md:p-8 flex flex-col justify-between">
                                            <div>
                                                {heroNews.fonteSite && heroNews.fonteSite !== 'Desconhecida' && (
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Tag className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm font-medium text-green-600 uppercase tracking-wide">
                                                            {heroNews.fonteSite}
                                                        </span>
                                                    </div>
                                                )}

                                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors line-clamp-3">
                                                    {heroNews.titulo}
                                                </h2>

                                                {heroNews.descricao && (
                                                    <p className="text-gray-600 leading-relaxed line-clamp-4 mb-4">
                                                        {heroNews.descricao}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(heroNews.dataPublicacao)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                                    Ler mais
                                                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            )}

                            {/* Grid de Cards - Restante das notícias */}
                            {gridNews.length > 0 && (
                                <div className="grid grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 gap-4 sm:gap-6">
                                    {gridNews.map((item) => (
                                        <article
                                            key={item.id}
                                            onClick={() => handleOpenNews(item)}
                                            className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 flex flex-col flex-shrink-0"
                                        >
                                            {/* Imagem */}
                                            <div className="relative h-48 sm:h-52 overflow-hidden bg-gray-100">
                                                {item.imagemUrl ? (
                                                    <img
                                                        src={item.imagemUrl}
                                                        alt={item.titulo}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/400x300/059669/ffffff?text=Notícia';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
                                                        <Newspaper className="w-12 h-12 text-white opacity-50" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Conteúdo */}
                                            <div className="p-4 sm:p-5 flex flex-col flex-1">
                                                {item.fonteSite && (
                                                    <div className="flex items-center gap-2 mb-2">

                                                    </div>
                                                )}

                                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                                                    {item.titulo}
                                                </h3>

                                                {item.descricao && (
                                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3 sm:mb-4 flex-1">
                                                        {item.descricao}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="truncate">{formatDate(item.dataPublicacao)}</span>
                                                    </div>
                                                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 sm:py-20 px-4">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <Newspaper className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                                {searchTerm || selectedSource
                                    ? 'Nenhuma notícia encontrada'
                                    : 'Nenhuma notícia disponível'}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-6 sm:mb-8">
                                {searchTerm || selectedSource
                                    ? 'Tente ajustar os filtros ou buscar por outros termos.'
                                    : 'Não há notícias cadastradas no momento.'}
                            </p>
                            {(searchTerm || selectedSource) && (
                                <button
                                    onClick={clearFilters}
                                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-medium flex items-center gap-2 mx-auto text-sm sm:text-base"
                                >
                                    <X className="w-4 h-4" />
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    )}

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="mt-8 sm:mt-12 flex flex-col items-center space-y-3 sm:space-y-4 px-4 sm:px-0">
                            <div className="flex items-center justify-center space-x-1 sm:space-x-2 overflow-x-auto pb-2 sm:pb-0">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>

                                <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0 ${currentPage === pageNum
                                                ? 'bg-green-600 text-white shadow-lg'
                                                : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                    {totalPages > 5 && (
                                        <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0 px-1">...</span>
                                    )}
                                    {totalPages > 5 && (
                                        <button
                                            onClick={() => handlePageChange(totalPages)}
                                            className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0 ${currentPage === totalPages
                                                ? 'bg-green-600 text-white shadow-lg'
                                                : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                                                }`}
                                        >
                                            {totalPages}
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                Página {currentPage} de {totalPages}
                            </p>
                        </div>
                    )}
                </section>
            </main>

            {NotificationComponent}
        </div>
    );
};

export default NewsPage;
