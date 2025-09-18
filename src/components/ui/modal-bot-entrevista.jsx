export const BotEntrevistaModal = ({ isOpen = true, onClose = () => {}, carregando = false, userId }) => {
  if (!isOpen) return null;

  console.log('🛎️ BotEntrevistaModal aberto', { isOpen, carregando, userId });

  const data = null; // Vou usar depois que eu  puxar do backent

  if (carregando) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Gerando relatório com IA...</p>
          <p className="text-gray-400 text-sm mt-2">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  // Dados estáticos para visualização (caso não receba via props)
  const entrevistaData = data || {
    // Informações Pessoais
    nome: "Isabelly Prado Rios",
    cidade: "Rio Verde - Goiás",
    email: "isabellypradorios@gmail.com",
    telefone: "(62) 98506-3917",
    linkedin: "Não informado",
    
    // Educação
    curso: "Agronomia",
    
    // Área de Atuação
    areaAtualAgro: "Agricultura",
    areaAtuacaoFutura: "Gestão Estratégica",
    
    // Experiência e Trabalho
    posicaoAtual: "Vendedor",
    trabalha: "Sim",
    salarioAtual: "R$10.000 - R$20.000",
    dispostoMudarCidade: "Depende",
    parceria: "UFG",
    
    // Outras Informações
    inglesFluente: "Não",
    outrasLinguas: "Não informado",
    lideranca: "Sim",
    integracaoAgro: "Sim",
    diferencial: "Cases de impacto nos negócios que passei",
    horarioEnvio: "11/06/2025 às 08:26",
    desafioAtual: "Outro",
    usuarioCadastrado: "Sim",
    
    // Consentimento
    autorizacaoDados: "✅ Claro, autorizo o uso de dados.",

    // Data para formatação
    timestamp: new Date("2025-06-11T08:26:00").getTime(),
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              � Respostas da Entrevista
            </h2>
            <p className="text-gray-400 mt-1">
              Enviado em {entrevistaData.horarioEnvio}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Pessoais */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              📋 Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <div>
                <p><strong className="text-purple-400">Nome:</strong> {entrevistaData.nome}</p>
                <p><strong className="text-purple-400">Cidade:</strong> {entrevistaData.cidade}</p>
                <p><strong className="text-purple-400">Email:</strong> {entrevistaData.email}</p>
              </div>
              <div>
                <p><strong className="text-purple-400">Telefone:</strong> {entrevistaData.telefone}</p>
                <p><strong className="text-purple-400">LinkedIn:</strong> {entrevistaData.linkedin}</p>
              </div>
            </div>
          </div>

          {/* Educação */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              � Educação
            </h3>
            <div className="grid grid-cols-1 gap-2 text-gray-300">
              <p><strong className="text-purple-400">Curso:</strong> {entrevistaData.curso}</p>
            </div>
          </div>

          {/* Área de Atuação */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🌱 Área de Atuação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <p><strong className="text-purple-400">Área Atual Agro:</strong> {entrevistaData.areaAtualAgro}</p>
              <p><strong className="text-purple-400">Área de Atuação Futura:</strong> {entrevistaData.areaAtuacaoFutura}</p>
            </div>
          </div>

          {/* Experiência e Trabalho */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              💼 Experiência e Trabalho
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <p><strong className="text-purple-400">Posição Atual:</strong> {entrevistaData.posicaoAtual}</p>
              <p><strong className="text-purple-400">Se trabalha:</strong> {entrevistaData.trabalha}</p>
              <p><strong className="text-purple-400">Salário Atual:</strong> {entrevistaData.salarioAtual}</p>
              <p><strong className="text-purple-400">Disposto a Mudar de Cidade:</strong> {entrevistaData.dispostoMudarCidade}</p>
              <p><strong className="text-purple-400">Parceria:</strong> {entrevistaData.parceria}</p>
            </div>
          </div>

          {/* Outras Informações */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              ℹ️ Outras Informações
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
              <p><strong className="text-purple-400">Inglês Fluente:</strong> {entrevistaData.inglesFluente}</p>
              <p><strong className="text-purple-400">Outras Línguas:</strong> {entrevistaData.outrasLinguas}</p>
              <p><strong className="text-purple-400">Liderança:</strong> {entrevistaData.lideranca}</p>
              <p><strong className="text-purple-400">Integração Agro:</strong> {entrevistaData.integracaoAgro}</p>
              <p><strong className="text-purple-400">Usuário cadastrado:</strong> {entrevistaData.usuarioCadastrado}</p>
              <p><strong className="text-purple-400">Desafio Atual:</strong> {entrevistaData.desafioAtual}</p>
            </div>
          </div>

          {/* Diferencial */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🌟 Diferencial
            </h3>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {entrevistaData.diferencial}
              </p>
            </div>
          </div>

          {/* Autorização */}
          <div className="bg-green-900/30 border border-green-700/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🔒 Consentimento
            </h3>
            <div className="text-green-400">
              <p><strong>Autorização de Uso de Dados:</strong> {entrevistaData.autorizacaoDados}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};