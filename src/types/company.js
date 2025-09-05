export const CompanyFields = {
  id: 'id',
  name: 'name',
  cnpj: 'cnpj',
  corporate_name: 'corporate_name',
  address: 'address',
  obs: 'obs',
  responsible: 'responsible',
  responsible_email: 'responsible_email',
  is_active: 'is_active',
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

  if (!company.cnpj?.trim()) {
    errors.cnpj = 'CNPJ é obrigatório';
  } else if (company.cnpj.replace(/[^\d]/g, '').length < 11) {
    errors.cnpj = 'CNPJ deve ter pelo menos 11 dígitos';
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
  cnpj: '',
  corporate_name: '',
  address: '',
  obs: '',
  responsible: '',
  responsible_email: '',
  is_active: CompanyStatus.ACTIVE
});