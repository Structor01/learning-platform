import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import phantomBusterService from '../../services/phantomBusterService';
import {
  Briefcase,
  Users,
  Search,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Eye,
  UserCheck,
  Building,
  Calendar,
  Filter,
  ExternalLink,
  Mail,
  Phone,
  Star,
  TrendingUp,
  Target,
  BarChart3,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

function JobDescription({ html }) {
  const cleanHtml = DOMPurify.sanitize(html);
  return <div className="text-gray-300 text-sm">{parse(cleanHtml)}</div>;
}

const RecrutamentoPage = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Estados para Phantom Buster
  const [phantomSearches, setPhantomSearches] = useState({});
  const [phantomResults, setPhantomResults] = useState({});
  const [showPhantomModal, setShowPhantomModal] = useState(false);

  useEffect(() => {
    fetchRecruitmentData();
  }, []);

  const fetchRecruitmentData = async () => {
    try {
      setLoading(true);
      

      const API_BASE_URL = import.meta.env.VITE_API_URL || "https://learning-platform-backend-2x39.onrender.com";

      
      // Buscar dados reais da API
      const [jobsResponse, analyticsResponse, historyResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/recruitment/jobs`),
        fetch(`${API_BASE_URL}/api/recruitment/analytics`),
        fetch(`${API_BASE_URL}/api/recruitment/search-history`)
      ]);

      if (jobsResponse.ok && analyticsResponse.ok && historyResponse.ok) {
        const jobsData = await jobsResponse.json();
        const analyticsData = await analyticsResponse.json();
        const historyData = await historyResponse.json();

        setJobs(jobsData);
        setAnalytics(analyticsData);
        setSearchHistory(historyData);
      } else {
        console.error('Erro ao carregar dados da API');
        setJobs([]);
        setAnalytics({ totalJobs: 0, totalCandidates: 0, activeJobs: 0 });
        setSearchHistory([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do Recrutamento:', error);
      setJobs([]);
      setAnalytics({ totalJobs: 0, totalCandidates: 0, activeJobs: 0 });
      setSearchHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSearch = async (jobId) => {
    try {
      setSearchLoading(true);
      const job = jobs.find(job => job.id === jobId);
      setSelectedJob(job);
      
      // Verificar se já existe uma busca para esta vaga
      if (phantomBusterService.hasExistingSearch(jobId)) {
        const existingSearch = phantomBusterService.getExistingSearch(jobId);
        
        if (existingSearch.status === 'started' || existingSearch.status === 'running') {
          // Verificar status atual da busca
          const statusResult = await phantomBusterService.checkSearchStatus(existingSearch.phantomId);
          
          if (statusResult.status === 'finished') {
            // Processar resultados
            const results = await phantomBusterService.processSearchResults(existingSearch.phantomId);
            if (results.success) {
              setSearchResults(results.profiles);
              setShowSearchModal(true);
              
              // Atualizar status local
              phantomBusterService.saveSearchInfo(jobId, {
                ...existingSearch,
                status: 'completed',
                results: results.profiles,
                completedAt: new Date().toISOString()
              });
            }
          } else {
            // Busca ainda em andamento
            alert(`Busca em andamento no Phantom Buster. Status: ${statusResult.status}`);
          }
        } else if (existingSearch.status === 'completed') {
          // Mostrar resultados existentes
          setSearchResults(existingSearch.results || []);
          setShowSearchModal(true);
        }
      } else {
        // Iniciar nova busca no Phantom Buster
        const result = await phantomBusterService.startLinkedInSearch(job);
        
        if (result.success) {
          // Salvar informações da busca
          setPhantomSearches(prev => ({
            ...prev,
            [jobId]: {
              phantomId: result.phantomId,
              status: 'started',
              startTime: new Date().toISOString(),
              job: job
            }
          }));
          
          alert(`Busca iniciada no Phantom Buster! ID: ${result.phantomId}\n\nA busca pode levar alguns minutos. Você pode verificar o progresso clicando novamente no botão.`);
        } else {
          alert(`Erro ao iniciar busca: ${result.message}`);
        }
      }
      
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      alert('Erro ao processar busca no LinkedIn');
    } finally {
      setSearchLoading(false);
    }
  };

  // Função para obter status da busca Phantom Buster
  const getPhantomSearchStatus = (jobId) => {
    const existingSearch = phantomBusterService.getExistingSearch(jobId);
    if (!existingSearch) return null;
    
    return {
      status: existingSearch.status,
      phantomId: existingSearch.phantomId,
      startTime: existingSearch.startTime,
      keywords: existingSearch.keywords
    };
  };

  // Função para obter texto e ícone do botão baseado no status
  const getSearchButtonContent = (jobId) => {
    if (searchLoading) {
      return {
        text: 'Buscando...',
        icon: <Loader className="h-4 w-4 mr-2 animate-spin" />,
        className: 'bg-blue-600 hover:bg-blue-700 text-white'
      };
    }

    const searchStatus = getPhantomSearchStatus(jobId);
    
    if (!searchStatus) {
      return {
        text: 'Buscar no LinkedIn',
        icon: <ExternalLink className="h-4 w-4 mr-2" />,
        className: 'bg-blue-600 hover:bg-blue-700 text-white'
      };
    }

    switch (searchStatus.status) {
      case 'started':
      case 'running':
        return {
          text: 'Verificar Status',
          icon: <Loader className="h-4 w-4 mr-2 animate-spin" />,
          className: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'completed':
        return {
          text: 'Ver Resultados',
          icon: <CheckCircle className="h-4 w-4 mr-2" />,
          className: 'bg-green-600 hover:bg-green-700 text-white'
        };
      case 'error':
        return {
          text: 'Tentar Novamente',
          icon: <AlertCircle className="h-4 w-4 mr-2" />,
          className: 'bg-red-600 hover:bg-red-700 text-white'
        };
      default:
        return {
          text: 'Buscar no LinkedIn',
          icon: <ExternalLink className="h-4 w-4 mr-2" />,
          className: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500 ';
      case 'paused': return 'bg-yellow-500 ';
      case 'closed': return 'bg-red-500 ';
      default: return 'bg-gray-500 ';
    }
  };

  const getExperienceColor = (level) => {
    switch (level) {
      case 'entry': return 'bg-blue-100 text-blue-800 ';
      case 'mid': return 'bg-orange-100 text-orange-800 ';
      case 'senior': return 'bg-purple-100 text-purple-800 ';
      case 'executive': return 'bg-red-100 text-red-800 ';
      default: return 'bg-gray-100 text-gray-800 ';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen  bg-gray-900  p-4 pt-20 flex items-center justify-center ">
          <div className="text-white  text-xl ">Carregando dados do Recrutamento da API...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen  bg-gray-900  text-white  p-4  pt-20 ">
        <div className="max-w-7xl  mx-auto ">
          {/* Header */}
          <div className="mb-8 ">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl  font-bold  text-white  mb-2 ">
                  Recrutamento LinkedIn Premium
                </h1>
                <p className="text-gray-400 ">
                  Gestão de vagas e busca de candidatos via API real
                </p>
              </div>
              <Button
                onClick={async () => {
                  const result = await phantomBusterService.testApiKey();
                  if (result.success) {
                    alert(`✅ ${result.message}\n\nPhantoms disponíveis:\n${result.phantoms.map(p => `- ${p.name} (${p.id})`).join('\n')}`);
                  } else {
                    alert(`❌ ${result.error}`);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Target className="h-4 w-4 mr-2" />
                Testar Phantom Buster
              </Button>
            </div>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4  gap-6  mb-8 ">
              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader className="flex flex-row  items-center justify-between  space-y-0  pb-2 ">
                  <CardTitle className="text-sm  font-medium  text-gray-400 ">
                    Total de Vagas
                  </CardTitle>
                  <Briefcase className="h-4 w-4  text-blue-400 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl  font-bold  text-white ">
                    {analytics.totalJobs}
                  </div>
                  <p className="text-xs  text-green-400 ">
                    {analytics.activeJobs} ativas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader className="flex flex-row  items-center justify-between  space-y-0  pb-2 ">
                  <CardTitle className="text-sm  font-medium  text-gray-400 ">
                    Candidatos Encontrados
                  </CardTitle>
                  <Users className="h-4 w-4  text-green-400 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl  font-bold  text-white ">
                    {analytics.totalCandidates}
                  </div>
                  <p className="text-xs  text-green-400 ">
                    Via LinkedIn Premium
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader className="flex flex-row  items-center justify-between  space-y-0  pb-2 ">
                  <CardTitle className="text-sm  font-medium  text-gray-400 ">
                    Match Score Médio
                  </CardTitle>
                  <Target className="h-4 w-4  text-orange-400 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl  font-bold  text-white ">
                    {analytics.averageMatchScore}%
                  </div>
                  <p className="text-xs  text-orange-400 ">
                    Compatibilidade
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader className="flex flex-row  items-center justify-between  space-y-0  pb-2 ">
                  <CardTitle className="text-sm  font-medium  text-gray-400 ">
                    Total Aplicações
                  </CardTitle>
                  <TrendingUp className="h-4 w-4  text-purple-400 " />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl  font-bold  text-white ">
                    {analytics.totalApplications || 0}
                  </div>
                  <p className="text-xs  text-purple-400 ">
                    Candidaturas recebidas
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1  mb-6  bg-gray-800  p-1  rounded-lg ">
            <Button
              variant={activeTab === 'jobs' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('jobs')}
              className={`flex-1  ${activeTab === 'jobs' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'} `}
            >
              <Briefcase className="h-4 w-4  mr-2 " />
              Vagas ({jobs.length})
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('history')}
              className={`flex-1  ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'} `}
            >
              <Search className="h-4 w-4  mr-2 " />
              Histórico ({searchHistory.length})
            </Button>
          </div>

          {/* Vagas Tab */}
          {activeTab === 'jobs' && (
            <div className="space-y-6 ">
              {jobs.length === 0 ? (
                <Card className="bg-gray-800  border-gray-700 ">
                  <CardContent className="text-center  py-12 ">
                    <Briefcase className="h-12 w-12  text-gray-400  mx-auto  mb-4 " />
                    <h3 className="text-lg  font-medium  text-white  mb-2 ">
                      Nenhuma vaga encontrada
                    </h3>
                    <p className="text-gray-400 ">
                      Verifique se a API está funcionando corretamente
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 ">
                  {jobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-gray-800  border-gray-700  hover:border-blue-500  transition-colors ">
                        <CardHeader>
                          <div className="flex justify-between  items-start ">
                            <div>
                              <CardTitle className="text-white  text-xl  mb-2 ">
                                {job.title}
                              </CardTitle>
                              <div className="flex items-center  gap-4  text-gray-400 ">
                                <div className="flex items-center  gap-1 ">
                                  <Building className="h-4 w-4 " />
                                  {job.company}
                                </div>
                                <div className="flex items-center  gap-1 ">
                                  <MapPin className="h-4 w-4 " />
                                  {job.location}
                                </div>
                                <div className="flex items-center  gap-1 ">
                                  <Calendar className="h-4 w-4 " />
                                  {formatDate(job.created_at)}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ">
                              <Badge className={`${getStatusColor(job.status)} text-white `}>
                                {job.status}
                              </Badge>
                              <Badge variant="outline" className={getExperienceColor(job.experience_level)}>
                                {job.experience_level}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4 ">
                            <div>
                              <h4 className="text-white  font-medium  mb-2 ">Descrição</h4>
                              <JobDescription html={job.description} />
                            </div>
                            
                            <div className="grid grid-cols-1 md:!grid-cols-3  gap-4 ">
                              <div className="flex items-center  gap-2  text-gray-400 ">
                                <DollarSign className="h-4 w-4 " />
                                <span className="text-sm ">{job.salary_range}</span>
                              </div>
                              <div className="flex items-center  gap-2  text-gray-400 ">
                                <UserCheck className="h-4 w-4 " />
                                <span className="text-sm ">{job.applications_count} aplicações</span>
                              </div>
                              <div className="flex items-center  gap-2  text-gray-400 ">
                                <Eye className="h-4 w-4 " />
                                <span className="text-sm ">{job.views_count} visualizações</span>
                              </div>
                            </div>

                            <div className="flex gap-2  pt-4 ">
                              {(() => {
                                const buttonContent = getSearchButtonContent(job.id);
                                return (
                                  <Button
                                    onClick={() => handleLinkedInSearch(job.id)}
                                    disabled={searchLoading}
                                    className={buttonContent.className}
                                  >
                                    {buttonContent.icon}
                                    {buttonContent.text}
                                  </Button>
                                );
                              })()}
                              <Button
                                variant="outline"
                                className="border-gray-600  text-gray-300  hover:bg-gray-700 "
                              >
                                <Eye className="h-4 w-4  mr-2 " />
                                Ver Detalhes
                              </Button>
                            </div>

                            {/* Status da busca Phantom Buster */}
                            {(() => {
                              const searchStatus = getPhantomSearchStatus(job.id);
                              if (!searchStatus) return null;
                              
                              return (
                                <div className="mt-3 p-3 bg-gray-700 rounded-lg border border-gray-600">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        searchStatus.status === 'completed' ? 'bg-green-500' :
                                        searchStatus.status === 'started' || searchStatus.status === 'running' ? 'bg-yellow-500 animate-pulse' :
                                        'bg-red-500'
                                      }`}></div>
                                      <span className="text-sm text-gray-300">
                                        Phantom Buster: {
                                          searchStatus.status === 'completed' ? 'Concluído' :
                                          searchStatus.status === 'started' ? 'Iniciado' :
                                          searchStatus.status === 'running' ? 'Em execução' :
                                          'Erro'
                                        }
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                      ID: {searchStatus.phantomId?.substring(0, 8)}...
                                    </span>
                                  </div>
                                  {searchStatus.keywords && (
                                    <div className="mt-2">
                                      <span className="text-xs text-gray-400">Keywords: </span>
                                      <span className="text-xs text-blue-400">{searchStatus.keywords}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Histórico Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6 ">
              <Card className="bg-gray-800  border-gray-700 ">
                <CardHeader>
                  <CardTitle className="text-white ">Histórico de Buscas LinkedIn</CardTitle>
                </CardHeader>
                <CardContent>
                  {searchHistory.length === 0 ? (
                    <div className="text-center  py-8 ">
                      <Search className="h-12 w-12  text-gray-400  mx-auto  mb-4 " />
                      <h3 className="text-lg  font-medium  text-white  mb-2 ">
                        Nenhuma busca realizada
                      </h3>
                      <p className="text-gray-400 ">
                        Realize buscas nas vagas para ver o histórico aqui
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 ">
                      {searchHistory.map((search) => (
                        <div
                          key={search.id}
                          className="flex justify-between  items-center  p-4  bg-gray-700  rounded-lg "
                        >
                          <div>
                            <h4 className="text-white  font-medium ">
                              {search.job_title}
                            </h4>
                            <p className="text-gray-400  text-sm ">
                              {search.job_company} • {search.location} • {search.experience_level}
                            </p>
                            <p className="text-gray-500  text-xs ">
                              Keywords: {search.keywords}
                            </p>
                          </div>
                          <div className="text-right ">
                            <div className="text-white  font-medium ">
                              {search.candidates_found} candidatos
                            </div>
                            <div className="text-gray-400  text-sm ">
                              {formatDate(search.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Modal de Resultados da Busca LinkedIn */}
          {showSearchModal && (
            <div className="fixed inset-0  bg-black bg-opacity-50  flex items-center justify-center  z-50  p-4 ">
              <div className="bg-gray-800  rounded-lg  max-w-4xl  w-full  max-h-[80vh]  overflow-y-auto ">
                <div className="p-6 ">
                  <div className="flex justify-between  items-center  mb-6 ">
                    <h2 className="text-2xl  font-bold  text-white ">
                      Candidatos Encontrados - {selectedJob?.title}
                    </h2>
                    <Button
                      variant="ghost"
                      onClick={() => setShowSearchModal(false)}
                      className="text-gray-400 hover:text-white "
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="grid gap-4 ">
                    {searchResults.map((candidate) => (
                      <Card key={candidate.id} className="bg-gray-700  border-gray-600 ">
                        <CardContent className="p-4 ">
                          <div className="flex items-start  gap-4 ">
                            <img
                              src={candidate.profile_image}
                              alt={candidate.name}
                              className="w-16 h-16  rounded-full "
                            />
                            <div className="flex-1 ">
                              <div className="flex justify-between  items-start  mb-2 ">
                                <div>
                                  <h3 className="text-white  font-medium  text-lg ">
                                    {candidate.name}
                                  </h3>
                                  <p className="text-gray-300 ">{candidate.title}</p>
                                  <p className="text-gray-400  text-sm ">
                                    {candidate.company} • {candidate.location}
                                  </p>
                                </div>
                                <div className="flex items-center  gap-2 ">
                                  <Badge className="bg-green-500  text-white ">
                                    {candidate.match_score}% match
                                  </Badge>
                                  <Star className="h-4 w-4  text-yellow-400 " />
                                </div>
                              </div>
                              
                              <p className="text-gray-300  text-sm  mb-3 ">
                                {candidate.summary}
                              </p>
                              
                              <div className="flex flex-wrap  gap-2  mb-3 ">
                                {candidate.skills.map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-blue-300  border-blue-500 ">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex gap-2 ">
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700  text-white "
                                  onClick={() => window.open(candidate.linkedin_url, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4  mr-1 " />
                                  LinkedIn
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600  text-gray-300  hover:bg-gray-600 "
                                >
                                  <Mail className="h-4 w-4  mr-1 " />
                                  Email
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600  text-gray-300  hover:bg-gray-600 "
                                >
                                  <Phone className="h-4 w-4  mr-1 " />
                                  Contato
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RecrutamentoPage;

