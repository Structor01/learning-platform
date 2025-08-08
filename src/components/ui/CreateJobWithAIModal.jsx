import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import companiesService from '@/services/companiesService';
import {
  X,
  Sparkles,
  Loader,
  CheckCircle,
  AlertCircle,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Building,
  Lightbulb,
  Target,
  Zap,
  Send,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

const CreateJobWithAIModal = ({ isOpen, onClose, onJobCreated }) => {
  const [step, setStep] = useState(1); // 1: prompt, 2: loading, 3: preview, 4: success
  const [prompt, setPrompt] = useState('');
  const [generatedJob, setGeneratedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [formData, setFormData] = useState({
    company_id: '',
    company_name: '',
    location: 'São Paulo, SP',
    job_type: 'full-time',
    experience_level: 'mid',
    work_model: 'hybrid',
    include_benefits: true,
    generate_questions: true,
    tone: 'professional'
  });

  // Carregar empresas quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadCompanies();
    }
  }, [isOpen]);

  const loadCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const result = await companiesService.getCompaniesForSelect();
      if (result.success) {
        setCompanies(result.companies);
        console.log(`✅ ${result.message}`);
      } else {
        setCompanies(result.companies); // Usar dados mock
        console.log(`⚠️ ${result.message}`);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleCompanyChange = (companyId) => {
    const selectedCompany = companies.find(c => c.id === parseInt(companyId));
    setFormData({
      ...formData,
      company_id: companyId,
      company_name: selectedCompany ? selectedCompany.name : ''
    });
  };

  const handleClose = () => {
    setStep(1);
    setPrompt('');
    setGeneratedJob(null);
    setLoading(false);
    setError(null);
    setCompanies([]);
    setFormData({
      company_id: '',
      company_name: '',
      location: 'São Paulo, SP',
      job_type: 'full-time',
      experience_level: 'mid',
      work_model: 'hybrid',
      include_benefits: true,
      generate_questions: true,
      tone: 'professional'
    });
    onClose();
  };

  const handleGenerateJob = async () => {
    if (!prompt.trim()) {
      setError('Por favor, descreva a vaga que deseja criar');
      return;
    }

    setLoading(true);
    setError(null);
    setStep(2);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "https://learning-platform-backend-2x39.onrender.com";
      
      const requestData = {
        prompt: prompt.trim(),
        ...formData
      };

      const response = await fetch(`${API_BASE_URL}/api/recruitment/jobs/generate-with-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.job) {
        setGeneratedJob(result);
        setStep(3);
      } else {
        throw new Error('Resposta inválida da API');
      }

    } catch (error) {
      console.error('Erro ao gerar vaga:', error);
      setError(`Erro ao gerar vaga: ${error.message}`);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async () => {
    setLoading(true);
    
    try {
      // A vaga já foi salva no backend durante a geração
      // Aqui apenas confirmamos e notificamos o componente pai
      if (onJobCreated) {
        onJobCreated(generatedJob.job);
      }
      
      setStep(4);
      
      // Fechar modal após 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar vaga:', error);
      setError(`Erro ao salvar vaga: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateJob = () => {
    setStep(1);
    setGeneratedJob(null);
    setError(null);
  };

  const promptSuggestions = [
    "Desenvolvedor Full Stack para startup de tecnologia",
    "Analista de Marketing Digital para e-commerce",
    "Gerente de Vendas para empresa de software",
    "Designer UX/UI para aplicativo mobile",
    "Contador para escritório de contabilidade",
    "Engenheiro de Dados para empresa de analytics"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Criar Vaga com IA</h2>
                  <p className="text-gray-400 text-sm">
                    Descreva a vaga e deixe a IA criar uma descrição completa
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Prompt Input */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Prompt Input */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Descreva a vaga que você quer criar
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ex: Desenvolvedor Full Stack para startup de tecnologia, com experiência em React e Node.js..."
                      className="w-full h-32 p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Quick Suggestions */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Sugestões rápidas
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {promptSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setPrompt(suggestion)}
                          className="text-left justify-start border-gray-600 text-gray-300 hover:bg-gray-700 h-auto py-2"
                        >
                          <Lightbulb className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{suggestion}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Empresa
                      </label>
                      <div className="relative">
                        <select
                          value={formData.company_id}
                          onChange={(e) => handleCompanyChange(e.target.value)}
                          disabled={loadingCompanies}
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10"
                        >
                          <option value="">
                            {loadingCompanies ? 'Carregando empresas...' : 'Selecione uma empresa'}
                          </option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name} {company.corporate_name && `(${company.corporate_name})`}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                      {loadingCompanies && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                          <Loader className="h-3 w-3 animate-spin" />
                          Carregando empresas...
                        </div>
                      )}
                      {companies.length === 0 && !loadingCompanies && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-yellow-400">
                          <AlertCircle className="h-3 w-3" />
                          Nenhuma empresa encontrada
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Localização
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Tipo de Contrato
                      </label>
                      <select
                        value={formData.job_type}
                        onChange={(e) => setFormData({...formData, job_type: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="full-time">Tempo Integral</option>
                        <option value="part-time">Meio Período</option>
                        <option value="contract">Contrato</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Nível de Experiência
                      </label>
                      <select
                        value={formData.experience_level}
                        onChange={(e) => setFormData({...formData, experience_level: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="entry">Júnior</option>
                        <option value="mid">Pleno</option>
                        <option value="senior">Sênior</option>
                        <option value="executive">Executivo</option>
                      </select>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="include_benefits"
                        checked={formData.include_benefits}
                        onChange={(e) => setFormData({...formData, include_benefits: e.target.checked})}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="include_benefits" className="text-white">
                        Incluir benefícios na descrição
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="generate_questions"
                        checked={formData.generate_questions}
                        onChange={(e) => setFormData({...formData, generate_questions: e.target.checked})}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="generate_questions" className="text-white">
                        Gerar perguntas customizadas para entrevista
                      </label>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-900 border border-red-700 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <span className="text-red-300">{error}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleGenerateJob}
                      disabled={!prompt.trim() || loading}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Vaga com IA
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancelar
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Loading */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="relative">
                    <Loader className="h-12 w-12 text-purple-500 animate-spin" />
                    <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-4">
                    Gerando vaga com IA...
                  </h3>
                  <p className="text-gray-400 text-center mt-2">
                    Analisando seu prompt e criando uma descrição completa
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Preview */}
              {step === 3 && generatedJob && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Vaga gerada com sucesso!</span>
                  </div>

                  {/* Job Preview */}
                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-xl mb-2">
                            {generatedJob.job.title}
                          </CardTitle>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {generatedJob.job.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {generatedJob.job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {generatedJob.job.job_type}
                            </div>
                            {generatedJob.job.salary_range && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {generatedJob.job.salary_range}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-600 text-white">
                            Gerada por IA
                          </Badge>
                          <Badge variant="outline" className="border-purple-500 text-purple-400">
                            {generatedJob.generation_details?.tone || 'Professional'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Descrição</h4>
                        <div className="text-gray-300 text-sm whitespace-pre-line">
                          {generatedJob.job.description}
                        </div>
                      </div>

                      {generatedJob.job.requirements && (
                        <div>
                          <h4 className="text-white font-medium mb-2">Requisitos</h4>
                          <div className="text-gray-300 text-sm">
                            {generatedJob.job.requirements}
                          </div>
                        </div>
                      )}

                      {generatedJob.job.benefits && (
                        <div>
                          <h4 className="text-white font-medium mb-2">Benefícios</h4>
                          <div className="text-gray-300 text-sm">
                            {generatedJob.job.benefits}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* AI Insights */}
                  {generatedJob.suggestions && (
                    <Card className="bg-blue-900 border-blue-700">
                      <CardHeader>
                        <CardTitle className="text-blue-200 flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Insights da IA
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {generatedJob.suggestions.optimization_tips && (
                          <div>
                            <h5 className="text-blue-200 font-medium mb-1">Dicas de Otimização:</h5>
                            <ul className="text-blue-300 text-sm space-y-1">
                              {generatedJob.suggestions.optimization_tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Zap className="h-3 w-3 mt-1 flex-shrink-0" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {generatedJob.suggestions.market_insights && (
                          <div>
                            <h5 className="text-blue-200 font-medium mb-1">Insights de Mercado:</h5>
                            <ul className="text-blue-300 text-sm space-y-1">
                              {generatedJob.suggestions.market_insights.map((insight, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <TrendingUp className="h-3 w-3 mt-1 flex-shrink-0" />
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Custom Questions */}
                  {generatedJob.custom_questions && generatedJob.custom_questions.length > 0 && (
                    <Card className="bg-purple-900 border-purple-700">
                      <CardHeader>
                        <CardTitle className="text-purple-200 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Perguntas Customizadas ({generatedJob.custom_questions.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {generatedJob.custom_questions.slice(0, 3).map((question, index) => (
                            <div key={index} className="text-purple-300 text-sm">
                              {index + 1}. {question}
                            </div>
                          ))}
                          {generatedJob.custom_questions.length > 3 && (
                            <div className="text-purple-400 text-sm">
                              +{generatedJob.custom_questions.length - 3} perguntas adicionais
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveJob}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Salvar Vaga
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRegenerateJob}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Gerar Novamente
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Vaga criada com sucesso!
                  </h3>
                  <p className="text-gray-400 text-center">
                    A vaga foi salva e já está disponível no sistema
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateJobWithAIModal;

