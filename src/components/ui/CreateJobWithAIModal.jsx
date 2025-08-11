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
  MessageSquare,
  Edit
} from 'lucide-react';

// Componente de formulário de edição de vaga (reutilizado do RecrutamentoPage)
const EditJobForm = ({ job, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: job?.title || '',
    company: job?.company || job?.company_name || '',
    location: job?.location || '',
    job_type: job?.job_type || '',
    salary_range: job?.salary_range || '',
    description: job?.description || '',
    requirements: job?.requirements || '',
    benefits: job?.benefits || '',
    summary: job?.summary || ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white font-medium mb-2">
            Título da Vaga
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Empresa
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Localização
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Tipo de Trabalho
          </label>
          <select
            name="job_type"
            value={formData.job_type}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Selecione o tipo</option>
            <option value="Remoto">Remoto</option>
            <option value="Presencial">Presencial</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-white font-medium mb-2">
          Faixa Salarial
        </label>
        <input
          type="text"
          name="salary_range"
          value={formData.salary_range}
          onChange={handleChange}
          placeholder="Ex: R$ 5.000 - R$ 8.000"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-2">
          Descrição
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          required
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-2">
          Requisitos
        </label>
        <textarea
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-2">
          Benefícios
        </label>
        <textarea
          name="benefits"
          value={formData.benefits}
          onChange={handleChange}
          rows={3}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-white font-medium mb-2">
          Resumo
        </label>
        <textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          rows={2}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
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
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Voltar
        </Button>
      </div>
    </form>
  );
};

const CreateJobWithAIModal = ({ isOpen, onClose, onJobCreated }) => {
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [generatedJob, setGeneratedJob] = useState(null);
  const [editedJob, setEditedJob] = useState(null); // Para armazenar dados editados
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
    setEditedJob(null); // Limpar dados editados
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
    // Usar dados editados se existirem, senão usar dados originais
    const jobToSave = editedJob || generatedJob?.job;
    if (onJobCreated && jobToSave) onJobCreated(jobToSave);
    setStep(5); // Mudando para step 5 (success)
    setTimeout(handleClose, 2000);
  };

  // Função para ir para edição
  const handleEdit = () => {
    setStep(4); // Step 4 será a edição
  };

  // Função para salvar edições
  const handleSaveEdit = async (editedData) => {
    console.log('💾 Salvando edições da vaga:', editedData);
    
    // Criar objeto de vaga editada
    const editedJobData = {
      ...generatedJob.job,
      ...editedData
    };
    
    setEditedJob(editedJobData);
    setStep(3); // Voltar para preview com dados editados
  };

  // Função para cancelar edição
  const handleCancelEdit = () => {
    setStep(3); // Voltar para preview
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
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Pré-visualização da Vaga</h3>
                        {editedJob && (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Editado
                          </Badge>
                        )}
                      </div>
                      
                      <Card className="bg-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white">
                            {editedJob?.title || generatedJob.job.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 mb-2">
                            {editedJob?.description || generatedJob.job.description}
                          </p>
                          <div className="flex gap-4 flex-wrap text-sm text-gray-400">
                            <Badge>{editedJob?.company || generatedJob.job.company_name}</Badge>
                            <Badge>{editedJob?.location || generatedJob.job.location}</Badge>
                            <Badge>{editedJob?.job_type || generatedJob.job.job_type}</Badge>
                          </div>
                          {(editedJob?.salary_range || generatedJob.job.salary_range) && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-green-400 border-green-400">
                                {editedJob?.salary_range || generatedJob.job.salary_range}
                              </Badge>
                            </div>
                          )}
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
                        <Button variant="outline" onClick={handleEdit} className="border-orange-600 text-orange-300 hover:bg-orange-700 hover:text-white">
                          <Edit className="w-4 h-4 mr-1"/> Editar
                        </Button>
                        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle className="w-4 h-4 mr-1"/> Salvar Vaga
                        </Button>
                      </div>
                    </div>
                )}

                {/* Step 4: Edit */}
                {step===4 && generatedJob && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-600 rounded-lg">
                          <Edit className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Editar Vaga</h3>
                          <p className="text-gray-400 text-sm">
                            Ajuste as informações da vaga gerada pela IA
                          </p>
                        </div>
                      </div>
                      
                      <EditJobForm 
                        job={editedJob || generatedJob.job}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                      />
                    </div>
                )}

                {/* Step 5: Success */}
                {step===5 && (
                    <div className="flex flex-col items-center py-20">
                      <CheckCircle className="w-12 h-12 text-green-400 mb-4"/>
                      <p className="text-green-300 font-semibold">Vaga criada com sucesso!</p>
                      {editedJob && (
                        <p className="text-gray-400 text-sm mt-2">
                          Suas edições foram aplicadas
                        </p>
                      )}
                    </div>
                )}

              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

export default CreateJobWithAIModal;
