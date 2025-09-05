import React, { useState, useEffect } from 'react';
import { X, Building2, Save, AlertCircle } from 'lucide-react';
import { validateCompany, CompanyStatus, formatCNPJ, formatPhone } from '../../types/company';

const CompanyFormModal = ({ isOpen, onClose, onSubmit, company, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    corporate_name: '',
    address: '',
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
          cnpj: company.cnpj || '',
          corporate_name: company.corporate_name || '',
          address: company.address || '',
          obs: company.obs || '',
          responsible: company.responsible || '',
          responsible_email: company.responsible_email || '',
          is_active: company.is_active !== undefined ? company.is_active : CompanyStatus.ACTIVE
        });
      } else {
        setFormData({
          name: '',
          cnpj: '',
          corporate_name: '',
          address: '',
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
    if (field === 'cnpj') {
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
        name: formData.name,
        cnpj: formData.cnpj.replace(/[^\d]/g, ''),
        corporate_name: formData.corporate_name,
        address: formData.address,
        obs: formData.obs,
        responsible: formData.responsible,
        responsible_email: formData.responsible_email,
        is_active: formData.is_active
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
      <div className="flex items-center justify-center min-h-screen px-2 sm:px-4 py-4 sm:py-8 text-center">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={handleClose} />

        {/* Modal */}
        <div className="relative inline-block w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl overflow-hidden text-left align-middle transition-all transform bg-gray-900 border border-gray-800 shadow-xl rounded-xl sm:rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-orange-600/20 rounded-lg sm:rounded-xl">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {isEditing ? 'Editar Empresa' : 'Nova Empresa'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                  {isEditing ? 'Atualize as informações da empresa' : 'Cadastre uma nova empresa parceira'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Nome */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-sm sm:text-base ${
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
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors font-mono text-sm sm:text-base ${
                    errors.cnpj ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="00.000.000/0000-00"
                />
                {errors.cnpj && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    {errors.cnpj}
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
              <div className="lg:col-span-2">
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
              <div className="lg:col-span-2">
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
              <div className="lg:col-span-2">
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
              <div className="lg:col-span-2">
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
              <div className="lg:col-span-2">
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 sm:px-6 sm:py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none font-semibold text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{isEditing ? 'Atualizar' : 'Salvar'}</span>
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