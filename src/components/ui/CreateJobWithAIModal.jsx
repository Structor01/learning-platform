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
  RefreshCw,
  Target,
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
    setError(null);
    try {
      const result = await companiesService.getCompaniesForSelect();
      if (result.success) {
        setCompanies(result.companies);
      } else {
        setCompanies(result.companies);
        setError(`⚠️ ${result.message}. Usando dados locais.`);
        setTimeout(() => setError(null), 5000);
      }
    } catch {
      const fallback = [
        { id: 1, name: 'Agroskills' },
        { id: 2, name: 'FAEG' },
        { id: 3, name: 'Senar Goiás' }
      ];
      setCompanies(fallback);
      setError('⚠️ Erro de conexão. Usando empresas padrão.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleCompanyChange = (e) => {
    const id = e.target.value;
    const selected = companies.find(c => c.id.toString() === id);
    setFormData({
      ...formData,
      company_id: id,
      company_name: selected ? selected.name : ''
    });
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleClose = () => {
    setStep(1);
    setPrompt('');
    setGeneratedJob(null);
    setError(null);
    setCompanies([]);
    setLoading(false);
    setFormData({
      company_id: '', company_name: '', location: 'São Paulo, SP',
      job_type: 'full-time', experience_level: 'mid', work_model: 'hybrid',
      include_benefits: true, generate_questions: true, tone: 'professional'
    });
    onClose();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return setError('Descreva a vaga a ser gerada');
    setLoading(true);
    setError(null);
    setStep(2);
    try {
      const API = import.meta.env.VITE_API_URL || 'https://learning-platform-backend-2x39.onrender.com';
      console.log('🔍 Gerando vaga com IA...');
      console.log('📊 Dados enviados:', { prompt: prompt.trim(), ...formData });
      
      const res = await fetch(`${API}/api/recruitment/jobs/generate-with-ai`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ prompt: prompt.trim(), ...formData })
      });
      
      console.log('📡 Status da resposta:', res.status);
      
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      
      console.log('✅ Dados recebidos da API:', data);
      console.log('🔍 Estrutura custom_questions:', data.custom_questions);
      console.log('🔍 Tipo custom_questions:', typeof data.custom_questions);
      console.log('🔍 É array?', Array.isArray(data.custom_questions));
      console.log('🔍 Estrutura market_insights:', data.suggestions?.market_insights);
      console.log('🔍 Tipo market_insights:', typeof data.suggestions?.market_insights);
      console.log('🔍 É array?', Array.isArray(data.suggestions?.market_insights));
      
      setGeneratedJob(data);
      setStep(3);
    } catch (err) {
      console.error('❌ Erro ao gerar vaga:', err);
      setError(err.message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (onJobCreated && generatedJob?.job) onJobCreated(generatedJob.job);
    setStep(4);
    setTimeout(handleClose, 2000);
  };

  const handleRegenerate = () => {
    setStep(1);
    setGeneratedJob(null);
    setError(null);
  };

  return (
      <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={e=>e.target===e.currentTarget && handleClose()}>

              <motion.div
                  initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
                  className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">

                {/* Step 1: Form */}
                {step===1 && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Criar Vaga com IA</h2>
                        <Button variant="ghost" onClick={handleClose}><X className="w-5 h-5"/></Button>
                      </div>
                      {error && <p className="text-red-400">{error}</p>}
                      <textarea
                          className="w-full p-2 rounded bg-gray-700 text-white"
                          rows={3}
                          placeholder="Descreva a vaga"
                          value={prompt}
                          onChange={e=>setPrompt(e.target.value)} />
                      <select name="company_id" value={formData.company_id} onChange={handleCompanyChange} className="w-full p-2 rounded bg-gray-700 text-white">
                        <option value="">Selecione empresa</option>
                        {Array.isArray(companies) ? companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>) : null}
                      </select>
                      <input name="location" value={formData.location} onChange={handleChange} placeholder="Localização" className="w-full p-2 rounded bg-gray-700 text-white" />
                      <div className="flex gap-2">
                        <select name="job_type" value={formData.job_type} onChange={handleChange} className="flex-1 p-2 rounded bg-gray-700 text-white">
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="contract">Contract</option>
                        </select>
                        <select name="experience_level" value={formData.experience_level} onChange={handleChange} className="flex-1 p-2 rounded bg-gray-700 text-white">
                          <option value="entry">Entry</option>
                          <option value="mid">Mid</option>
                          <option value="senior">Senior</option>
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleGenerate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Sparkles className="w-4 h-4 mr-2"/> Gerar Vaga
                        </Button>
                      </div>
                    </div>
                )}

                {/* Step 2: Loading */}
                {step===2 && (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Loader className="animate-spin w-8 h-8 text-white mb-4"/>
                      <p className="text-white">Gerando vaga...</p>
                    </div>
                )}

                {/* Step 3: Preview */}
                {step===3 && generatedJob && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white">Pré-visualização da Vaga</h3>
                      <Card className="bg-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white">{generatedJob.job.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 mb-2">{generatedJob.job.description}</p>
                          <div className="flex gap-4 flex-wrap text-sm text-gray-400">
                            <Badge>{generatedJob.job.company_name}</Badge>
                            <Badge>{generatedJob.job.location}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      {Array.isArray(generatedJob.suggestions?.market_insights) && generatedJob.suggestions.market_insights.length > 0 && (
                          <Card className="bg-blue-900">
                            <CardHeader>
                              <CardTitle className="text-blue-200 flex items-center gap-2"><Target/>Insights</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="text-blue-300 space-y-1 text-sm">
                                {generatedJob.suggestions.market_insights.map((i,idx)=><li key={idx} className="flex items-start gap-2"><TrendingUp/> {i}</li>)}
                              </ul>
                            </CardContent>
                          </Card>
                      )}
                      {Array.isArray(generatedJob.custom_questions) && generatedJob.custom_questions.length > 0 && (
                          <Card className="bg-purple-900">
                            <CardHeader>
                              <CardTitle className="text-purple-200 flex items-center gap-2"><MessageSquare/>Perguntas</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="text-purple-300 space-y-1 text-sm">
                                {Array.isArray(generatedJob.custom_questions) && generatedJob.custom_questions.length > 0 
                                  ? generatedJob.custom_questions.map((q,idx)=><li key={idx}>• {q}</li>)
                                  : <li className="text-gray-400">Nenhuma pergunta personalizada gerada</li>
                                }
                              </ul>
                            </CardContent>
                          </Card>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleRegenerate} className="text-white">
                          <RefreshCw className="w-4 h-4 mr-1"/> Regenerar
                        </Button>
                        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle className="w-4 h-4 mr-1"/> Salvar Vaga
                        </Button>
                      </div>
                    </div>
                )}

                {/* Step 4: Success */}
                {step===4 && (
                    <div className="flex flex-col items-center py-20">
                      <CheckCircle className="w-12 h-12 text-green-400 mb-4"/>
                      <p className="text-green-300 font-semibold">Vaga criada com sucesso!</p>
                    </div>
                )}

              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

export default CreateJobWithAIModal;
