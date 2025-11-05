/**
 * Decodifica HTML entities em uma string
 * Converte entidades como &ccedil;, &acute;, &ocirc; em caracteres Unicode
 * @param {string} html - String com HTML entities
 * @returns {string} String decodificada
 */
export const decodeHtmlEntities = (html) => {
  if (!html) return '';

  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
};

/**
 * Decodifica todos os campos de texto de um objeto vaga
 * @param {object} vaga - Objeto da vaga
 * @returns {object} Vaga com campos decodificados
 */
export const decodeVaga = (vaga) => {
  if (!vaga) return vaga;

  return {
    ...vaga,
    title: decodeHtmlEntities(vaga.title),
    nome: decodeHtmlEntities(vaga.nome),
    description: decodeHtmlEntities(vaga.description),
    descricao: decodeHtmlEntities(vaga.descricao),
    location: decodeHtmlEntities(vaga.location),
    cidade: decodeHtmlEntities(vaga.cidade),
    state: decodeHtmlEntities(vaga.state),
    job_type: decodeHtmlEntities(vaga.job_type),
    modalidade: decodeHtmlEntities(vaga.modalidade),
  };
};

/**
 * Decodifica uma lista de vagas
 * @param {array} vagas - Array de vagas
 * @returns {array} Array de vagas decodificadas
 */
export const decodeVagas = (vagas) => {
  if (!Array.isArray(vagas)) return vagas;
  return vagas.map(decodeVaga);
};
