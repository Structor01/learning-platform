import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
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
  LinkedIn,
  Mail,
  Phone,
  Star,
  TrendingUp,
  Target,
  BarChart3
} from 'lucide-react';

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

  useEffect(() => {
    fetchRecruitmentData();
  }, []);

  const fetchRecruitmentData = async () => {
    try {
      setLoading(true);
      
      // Configurar URLs da API
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://learning-platform-backend-2x39.onrender.com'
        : 'https://3001-ikjlsjh5wfosw5vrl3xjt-f4ac7591.manusvm.computer';
      
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
      setSelectedJob(jobs.find(job => job.id === jobId));
      
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://learning-platform-backend-2x39.onrender.com'
        : 'https://3001-ikjlsjh5wfosw5vrl3xjt-f4ac7591.manusvm.computer';

      const response = await fetch(`${API_BASE_URL}/api/recruitment/jobs/${jobId}/search-linkedin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: 'agronomia engenheiro',
          location: 'São Paulo',
          experienceLevel: 'senior'
        })
      });

      if (response.ok) {
        const candidates = await response.json();
        setSearchResults(candidates);
        setShowSearchModal(true);
        // Atualizar histórico
        await fetchRecruitmentData();
      } else {
        console.error('Erro na busca LinkedIn');
      }
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500 !important';
      case 'paused': return 'bg-yellow-500 !important';
      case 'closed': return 'bg-red-500 !important';
      default: return 'bg-gray-500 !important';
    }
  };

  const getExperienceColor = (level) => {
    switch (level) {
      case 'entry': return 'bg-blue-100 text-blue-800 !important';
      case 'mid': return 'bg-orange-100 text-orange-800 !important';
      case 'senior': return 'bg-purple-100 text-purple-800 !important';
      case 'executive': return 'bg-red-100 text-red-800 !important';
      default: return 'bg-gray-100 text-gray-800 !important';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen !important bg-gray-900 !important p-4 !important pt-20 !important flex items-center justify-center !important">
          <div className="text-white !important text-xl !important">Carregando dados do Recrutamento da API...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen !important bg-gray-900 !important text-white !important p-4 !important pt-20 !important">
        <div className="max-w-7xl !important mx-auto !important">
          {/* Header */}
          <div className="mb-8 !important">
            <h1 className="text-3xl !important font-bold !important text-white !important mb-2 !important">
              Recrutamento LinkedIn Premium
            </h1>
            <p className="text-gray-400 !important">
              Gestão de vagas e busca de candidatos via API real
            </p>
          </div>

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 !important gap-6 !important mb-8 !important">
              <Card className="bg-gray-800 !important border-gray-700 !important">
                <CardHeader className="flex flex-row !important items-center justify-between !important space-y-0 !important pb-2 !important">
                  <CardTitle className="text-sm !important font-medium !important text-gray-400 !important">
                    Total de Vagas
                  </CardTitle>
                  <Briefcase className="h-4 w-4 !important text-blue-400 !important" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl !important font-bold !important text-white !important">
                    {analytics.totalJobs}
                  </div>
                  <p className="text-xs !important text-green-400 !important">
                    {analytics.activeJobs} ativas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 !important border-gray-700 !important">
                <CardHeader className="flex flex-row !important items-center justify-between !important space-y-0 !important pb-2 !important">
                  <CardTitle className="text-sm !important font-medium !important text-gray-400 !important">
                    Candidatos Encontrados
                  </CardTitle>
                  <Users className="h-4 w-4 !important text-green-400 !important" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl !important font-bold !important text-white !important">
                    {analytics.totalCandidates}
                  </div>
                  <p className="text-xs !important text-green-400 !important">
                    Via LinkedIn Premium
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 !important border-gray-700 !important">
                <CardHeader className="flex flex-row !important items-center justify-between !important space-y-0 !important pb-2 !important">
                  <CardTitle className="text-sm !important font-medium !important text-gray-400 !important">
                    Match Score Médio
                  </CardTitle>
                  <Target className="h-4 w-4 !important text-orange-400 !important" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl !important font-bold !important text-white !important">
                    {analytics.averageMatchScore}%
                  </div>
                  <p className="text-xs !important text-orange-400 !important">
                    Compatibilidade
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 !important border-gray-700 !important">
                <CardHeader className="flex flex-row !important items-center justify-between !important space-y-0 !important pb-2 !important">
                  <CardTitle className="text-sm !important font-medium !important text-gray-400 !important">
                    Total Aplicações
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 !important text-purple-400 !important" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl !important font-bold !important text-white !important">
                    {analytics.totalApplications || 0}
                  </div>
                  <p className="text-xs !important text-purple-400 !important">
                    Candidaturas recebidas
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 !important mb-6 !important bg-gray-800 !important p-1 !important rounded-lg !important">
            <Button
              variant={activeTab === 'jobs' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 !important ${activeTab === 'jobs' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'} !important`}
            >
              <Briefcase className="h-4 w-4 !important mr-2 !important" />
              Vagas ({jobs.length})
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('history')}
              className={`flex-1 !important ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'} !important`}
            >
              <Search className="h-4 w-4 !important mr-2 !important" />
              Histórico ({searchHistory.length})
            </Button>
          </div>

          {/* Vagas Tab */}
          {activeTab === 'jobs' && (
            <div className="space-y-6 !important">
              {jobs.length === 0 ? (
                <Card className="bg-gray-800 !important border-gray-700 !important">
                  <CardContent className="text-center !important py-12 !important">
                    <Briefcase className="h-12 w-12 !important text-gray-400 !important mx-auto !important mb-4 !important" />
                    <h3 className="text-lg !important font-medium !important text-white !important mb-2 !important">
                      Nenhuma vaga encontrada
                    </h3>
                    <p className="text-gray-400 !important">
                      Verifique se a API está funcionando corretamente
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 !important">
                  {jobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-gray-800 !important border-gray-700 !important hover:border-blue-500 !important transition-colors !important">
                        <CardHeader>
                          <div className="flex justify-between !important items-start !important">
                            <div>
                              <CardTitle className="text-white !important text-xl !important mb-2 !important">
                                {job.title}
                              </CardTitle>
                              <div className="flex items-center !important gap-4 !important text-gray-400 !important">
                                <div className="flex items-center !important gap-1 !important">
                                  <Building className="h-4 w-4 !important" />
                                  {job.company}
                                </div>
                                <div className="flex items-center !important gap-1 !important">
                                  <MapPin className="h-4 w-4 !important" />
                                  {job.location}
                                </div>
                                <div className="flex items-center !important gap-1 !important">
                                  <Calendar className="h-4 w-4 !important" />
                                  {formatDate(job.created_at)}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 !important">
                              <Badge className={`${getStatusColor(job.status)} text-white !important`}>
                                {job.status}
                              </Badge>
                              <Badge variant="outline" className={getExperienceColor(job.experience_level)}>
                                {job.experience_level}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4 !important">
                            <div>
                              <h4 className="text-white !important font-medium !important mb-2 !important">Descrição</h4>
                              <p className="text-gray-300 !important text-sm !important">
                                {job.description}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 !important gap-4 !important">
                              <div className="flex items-center !important gap-2 !important text-gray-400 !important">
                                <DollarSign className="h-4 w-4 !important" />
                                <span className="text-sm !important">{job.salary_range}</span>
                              </div>
                              <div className="flex items-center !important gap-2 !important text-gray-400 !important">
                                <UserCheck className="h-4 w-4 !important" />
                                <span className="text-sm !important">{job.applications_count} aplicações</span>
                              </div>
                              <div className="flex items-center !important gap-2 !important text-gray-400 !important">
                                <Eye className="h-4 w-4 !important" />
                                <span className="text-sm !important">{job.views_count} visualizações</span>
                              </div>
                            </div>

                            <div className="flex gap-2 !important pt-4 !important">
                              <Button
                                onClick={() => handleLinkedInSearch(job.id)}
                                disabled={searchLoading}
                                className="bg-blue-600 hover:bg-blue-700 !important text-white !important"
                              >
                                <LinkedIn className="h-4 w-4 !important mr-2 !important" />
                                {searchLoading ? 'Buscando...' : 'Buscar no LinkedIn'}
                              </Button>
                              <Button
                                variant="outline"
                                className="border-gray-600 !important text-gray-300 !important hover:bg-gray-700 !important"
                              >
                                <Eye className="h-4 w-4 !important mr-2 !important" />
                                Ver Detalhes
                              </Button>
                            </div>
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
            <div className="space-y-6 !important">
              <Card className="bg-gray-800 !important border-gray-700 !important">
                <CardHeader>
                  <CardTitle className="text-white !important">Histórico de Buscas LinkedIn</CardTitle>
                </CardHeader>
                <CardContent>
                  {searchHistory.length === 0 ? (
                    <div className="text-center !important py-8 !important">
                      <Search className="h-12 w-12 !important text-gray-400 !important mx-auto !important mb-4 !important" />
                      <h3 className="text-lg !important font-medium !important text-white !important mb-2 !important">
                        Nenhuma busca realizada
                      </h3>
                      <p className="text-gray-400 !important">
                        Realize buscas nas vagas para ver o histórico aqui
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 !important">
                      {searchHistory.map((search) => (
                        <div
                          key={search.id}
                          className="flex justify-between !important items-center !important p-4 !important bg-gray-700 !important rounded-lg !important"
                        >
                          <div>
                            <h4 className="text-white !important font-medium !important">
                              {search.job_title}
                            </h4>
                            <p className="text-gray-400 !important text-sm !important">
                              {search.job_company} • {search.location} • {search.experience_level}
                            </p>
                            <p className="text-gray-500 !important text-xs !important">
                              Keywords: {search.keywords}
                            </p>
                          </div>
                          <div className="text-right !important">
                            <div className="text-white !important font-medium !important">
                              {search.candidates_found} candidatos
                            </div>
                            <div className="text-gray-400 !important text-sm !important">
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
            <div className="fixed inset-0 !important bg-black bg-opacity-50 !important flex items-center justify-center !important z-50 !important p-4 !important">
              <div className="bg-gray-800 !important rounded-lg !important max-w-4xl !important w-full !important max-h-[80vh] !important overflow-y-auto !important">
                <div className="p-6 !important">
                  <div className="flex justify-between !important items-center !important mb-6 !important">
                    <h2 className="text-2xl !important font-bold !important text-white !important">
                      Candidatos Encontrados - {selectedJob?.title}
                    </h2>
                    <Button
                      variant="ghost"
                      onClick={() => setShowSearchModal(false)}
                      className="text-gray-400 hover:text-white !important"
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="grid gap-4 !important">
                    {searchResults.map((candidate) => (
                      <Card key={candidate.id} className="bg-gray-700 !important border-gray-600 !important">
                        <CardContent className="p-4 !important">
                          <div className="flex items-start !important gap-4 !important">
                            <img
                              src={candidate.profile_image}
                              alt={candidate.name}
                              className="w-16 h-16 !important rounded-full !important"
                            />
                            <div className="flex-1 !important">
                              <div className="flex justify-between !important items-start !important mb-2 !important">
                                <div>
                                  <h3 className="text-white !important font-medium !important text-lg !important">
                                    {candidate.name}
                                  </h3>
                                  <p className="text-gray-300 !important">{candidate.title}</p>
                                  <p className="text-gray-400 !important text-sm !important">
                                    {candidate.company} • {candidate.location}
                                  </p>
                                </div>
                                <div className="flex items-center !important gap-2 !important">
                                  <Badge className="bg-green-500 !important text-white !important">
                                    {candidate.match_score}% match
                                  </Badge>
                                  <Star className="h-4 w-4 !important text-yellow-400 !important" />
                                </div>
                              </div>
                              
                              <p className="text-gray-300 !important text-sm !important mb-3 !important">
                                {candidate.summary}
                              </p>
                              
                              <div className="flex flex-wrap !important gap-2 !important mb-3 !important">
                                {candidate.skills.map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-blue-300 !important border-blue-500 !important">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex gap-2 !important">
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 !important text-white !important"
                                  onClick={() => window.open(candidate.linkedin_url, '_blank')}
                                >
                                  <LinkedIn className="h-4 w-4 !important mr-1 !important" />
                                  LinkedIn
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600 !important text-gray-300 !important hover:bg-gray-600 !important"
                                >
                                  <Mail className="h-4 w-4 !important mr-1 !important" />
                                  Email
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-600 !important text-gray-300 !important hover:bg-gray-600 !important"
                                >
                                  <Phone className="h-4 w-4 !important mr-1 !important" />
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

