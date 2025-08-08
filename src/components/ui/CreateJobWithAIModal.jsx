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
  ChevronDown,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

const CreateJobWithAIModal = ({ isOpen, onClose, onJobCreated }) => {
  const [step, setStep] = useState(1);
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

  useEffect(() => {
    if (isOpen) loadCompanies();
  }, [isOpen]);

  const loadCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const result = await companiesService.getCompaniesForSelect();
      setCompanies(result.companies || []);
    } catch {
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleCompanyChange = (companyId) => {
    const selected = companies.find(c => c.id === parseInt(companyId));
    setFormData({
      ...formData,
      company_id: companyId,
      company_name: selected ? selected.name : ''
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
      const requestData = { prompt: prompt.trim(), ...formData };
      const response = await fetch(`${API_BASE_URL}/api/recruitment/jobs/generate-with-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);
      const result = await response.json();
      if (result.job) {
        setGeneratedJob(result);
        setStep(3);
      } else {
        throw new Error('Resposta inválida da API');
      }
    } catch (err) {
      setError(`Erro ao gerar vaga: ${err.message}`);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = () => {
    setLoading(true);
    if (onJobCreated) onJobCreated(generatedJob.job);
    setStep(4);
    setTimeout(handleClose, 2000);
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
                onClick={e => e.target === e.currentTarget && handleClose()}
            >
              <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                {/* ... restante do conteúdo inalterado ... */}
                {step === 3 && generatedJob && (
                    <Card className="bg-blue-900 border-blue-700">
                      <CardHeader>
                        <CardTitle className="text-blue-200 flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Insights da IA
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
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
                {step === 3 && generatedJob.custom_questions && (
                    <Card className="bg-purple-900 border-purple-700">
                      <CardHeader>
                        <CardTitle className="text-purple-200 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Perguntas Customizadas ({generatedJob.custom_questions.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* ... perguntas ... */}
                      </CardContent>
                    </Card>
                )}
                {/* ... restante ... */}
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

export default CreateJobWithAIModal;
