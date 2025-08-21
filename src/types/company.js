export const CompanyFields = {
  id: 'id',
  name: 'name',
  cnpj: 'cpnj', // Campo na tabela é 'cpnj'
  corporate_name: 'corporate_name',
  address: 'address', // Campo na tabela é 'address'
  state_id: 'state_id',
  city_id: 'city_id',
  obs: 'obs',
  responsible: 'responsible',
  responsible_email: 'responsible_email',
  is_active: 'is_active', // Campo na tabela é 'is_active'
  slug: 'slug',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

export const CompanyStatus = {
  ACTIVE: true,
  INACTIVE: false
};

export const validateCompany = (company) => {
  const errors = {};

  if (!company.name?.trim()) {
    errors.name = 'Nome é obrigatório';
  }

  if (!company.cpnj?.trim()) {
    errors.cpnj = 'CNPJ é obrigatório';
  }

  if (!company.responsible_email?.trim()) {
    errors.responsible_email = 'E-mail é obrigatório';
  } else if (!isValidEmail(company.responsible_email)) {
    errors.responsible_email = 'E-mail inválido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  return cleanCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  if (cleanPhone.length === 10) {
    return cleanPhone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  } else if (cleanPhone.length === 11) {
    return cleanPhone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  
  return phone;
};

export const createEmptyCompany = () => ({
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