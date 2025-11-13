
export function api(path, init) {
  const accessToken = localStorage.getItem('accessToken')

  // Acessa a variável de ambiente de forma segura com fallback
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  const apiPrefix = ''

  // Verifica se o path já é uma URL completa
  const url = path.startsWith('http') ? path : new URL(apiPrefix.concat(path), baseUrl).toString()


  const config = {
    ...init,
    headers: {
      ...init?.headers,
      'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      'Content-Type': 'application/json',
    }
  }

  // Retorna a Promise do fetch para que possa ser tratada pelo chamador
  return fetch(url, config)
    .then(response => {
      (`📊 Resposta da API: ${response.status} ${response.statusText}`);
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .catch(error => {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
      }
      console.error('❌ Erro na requisição:', error);
      throw error;
    });
}
