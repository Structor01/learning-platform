import React, { useState, useEffect } from 'react';
import { X, Building2, Save, AlertCircle } from 'lucide-react';
import { validateCompany, CompanyStatus, formatCNPJ, formatPhone } from '../../types/company';

const CompanyFormModal = ({ isOpen, onClose, onSubmit, company, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    cpnj: '',
    corporate_name: '',
    address: '',
    state_id: null,
    city_id: null,
    obs: '',
    responsible: '',
    responsible_email: '',
    is_active: CompanyStatus.ACTIVE
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && company) {
        setFormData({
          name: company.name || '',
          cpnj: company.cpnj || '',
          corporate_name: company.corporate_name || '',
          address: company.address || '',
          state_id: company.state_id || null,
          city_id: company.city_id || null,
          obs: company.obs || '',
          responsible: company.responsible || '',
          responsible_email: company.responsible_email || '',
          is_active: company.is_active !== undefined ? company.is_active : CompanyStatus.ACTIVE
        });
      } else {
        setFormData({
          name: '',
          cpnj: '',
          corporate_name: '',
          address: '',
          state_id: null,
          city_id: null,
          obs: '',
          responsible: '',
          responsible_email: '',
          is_active: CompanyStatus.ACTIVE
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, company]);

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    
    // Formatação automática
    if (field === 'cpnj') {
      const cleanCNPJ = value.replace(/[^\d]/g, '');
      if (cleanCNPJ.length <= 14) {
        formattedValue = formatCNPJ(cleanCNPJ);
      } else {
        return; // Não permitir mais de 14 dígitos
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação
    const validation = validateCompany(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Preparar dados para envio (remover formatação do CNPJ)
      const submitData = {
        ...formData,
        cpnj: formData.cpnj.replace(/[^\d]/g, '')
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={handleClose} />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-900 border border-gray-800 shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-600/20 rounded-xl">
                <Building2 className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEditing ? 'Editar Empresa' : 'Nova Empresa'}
                </h2>
                <p className="text-sm text-gray-400">
                  {isEditing ? 'Atualize as informações da empresa' : 'Cadastre uma nova empresa parceira'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Digite o nome da empresa"
                />
                {errors.name && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </div>
                )}
              </div>

              {/* CNPJ */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={formData.cpnj}
                  onChange={(e) => handleInputChange('cpnj', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors font-mono ${
                    errors.cpnj ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="00.000.000/0000-00"
                />
                {errors.cpnj && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {errors.cpnj}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Status
                </label>
                <select
                  value={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                >
                  <option value={true}>Ativa</option>
                  <option value={false}>Inativa</option>
                </select>
              </div>

              {/* Razão Social */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Razão Social
                </label>
                <input
                  type="text"
                  value={formData.corporate_name}
                  onChange={(e) => handleInputChange('corporate_name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                  placeholder="Digite a razão social"
                />
              </div>

              {/* Endereço */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                  placeholder="Rua, número, bairro, cidade, estado"
                />
              </div>

              {/* E-mail do Responsável */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  E-mail do Responsável *
                </label>
                <input
                  type="email"
                  value={formData.responsible_email}
                  onChange={(e) => handleInputChange('responsible_email', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                    errors.responsible_email ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="responsavel@empresa.com"
                />
                {errors.responsible_email && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {errors.responsible_email}
                  </div>
                )}
              </div>

              {/* Responsável */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Responsável
                </label>
                <input
                  type="text"
                  value={formData.responsible}
                  onChange={(e) => handleInputChange('responsible', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                  placeholder="Nome do responsável pela empresa"
                />
              </div>

              {/* Observações */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Observações
                </label>
                <textarea
                  rows={4}
                  value={formData.obs}
                  onChange={(e) => handleInputChange('obs', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors resize-vertical"
                  placeholder="Informações adicionais sobre a empresa..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEditing ? 'Atualizar' : 'Salvar'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyFormModal;