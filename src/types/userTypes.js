export const USER_TYPES = {
  CANDIDATE: 'candidate',
  COMPANY: 'company'
};

export const USER_TYPE_LABELS = {
  [USER_TYPES.CANDIDATE]: 'Candidato',
  [USER_TYPES.COMPANY]: 'Empresa'
};

export const validateUserType = (userType) => {
  return Object.values(USER_TYPES).includes(userType);
};