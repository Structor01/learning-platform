const ReportHeader = ({ selectedTest, user, getDiscProfileName }) => {
  return (
    <div className="bg-white shadow-sm border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Relatório Psicológico</h1>
        <h2 className="text-lg text-gray-700 mb-3">{user?.name || 'Nome do Candidato'}</h2>
        <div className="text-sm text-gray-600">
          Data da aplicação: {new Date(selectedTest.createdAt).toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white bg-gray-800 px-3 py-2 mb-3">RESUMO EXECUTIVO</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Este relatório apresenta uma análise detalhada do perfil comportamental baseado na metodologia DISC. 
          O perfil predominante identificado é <strong>{getDiscProfileName(selectedTest.dominantProfile)}</strong>, 
          com {selectedTest.detailedResults?.disc?.percentages[selectedTest.dominantProfile]}% de predominância. 
          Os resultados incluem análises complementares de Big Five e Inteligência Emocional para uma compreensão 
          integral do perfil psicológico.
        </p>
      </div>

      {/* Barra DISC Colorida */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white bg-gray-800 px-3 py-2 mb-3">PERFIL COMPORTAMENTAL</h3>
        <div className="flex h-8 border border-gray-300">
          <div 
            className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${selectedTest.discDPercentage}%` }}
          >
            {selectedTest.discDPercentage > 12 && `${selectedTest.discDPercentage}%`}
          </div>
          <div 
            className="bg-red-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${selectedTest.discIPercentage}%` }}
          >
            {selectedTest.discIPercentage > 12 && `${selectedTest.discIPercentage}%`}
          </div>
          <div 
            className="bg-yellow-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${selectedTest.discSPercentage}%` }}
          >
            {selectedTest.discSPercentage > 12 && `${selectedTest.discSPercentage}%`}
          </div>
          <div 
            className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${selectedTest.discCPercentage}%` }}
          >
            {selectedTest.discCPercentage > 12 && `${selectedTest.discCPercentage}%`}
          </div>
        </div>
        <div className="flex justify-between text-xs mt-1 text-gray-600">
          <span>D - Dominância ({selectedTest.discDPercentage}%)</span>
          <span>I - Influência ({selectedTest.discIPercentage}%)</span>
          <span>S - Estabilidade ({selectedTest.discSPercentage}%)</span>
          <span>C - Conformidade ({selectedTest.discCPercentage}%)</span>
        </div>
      </div>

      {/* Lista dos fatores avaliados */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">O que foi identificado neste questionário:</h4>
        <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
          <li>Perfil comportamental predominante</li>
          <li>Estilo de comunicação preferido</li>
          <li>Características de liderança</li>
          <li>Ambiente de trabalho ideal</li>
          <li>Áreas de desenvolvimento</li>
          <li>Recomendações de carreira</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportHeader;