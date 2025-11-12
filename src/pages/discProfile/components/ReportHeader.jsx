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
          {/* D - Dominante (Vermelho) */}
          <div 
            className="bg-red-500 flex items-center justify-center text-white text-xs font-bold border-r border-white/20"
            style={{ 
              width: selectedTest.discDPercentage > 0 ? `${selectedTest.discDPercentage}%` : '0%',
              minWidth: '2%'
            }}
          >
            {selectedTest.discDPercentage > 8 && `${selectedTest.discDPercentage}%`}
          </div>
          {/* I - Influente (Amarelo) */}
          <div 
            className="bg-yellow-500 flex items-center justify-center text-white text-xs font-bold border-r border-white/20"
            style={{ 
              width: selectedTest.discIPercentage > 0 ? `${selectedTest.discIPercentage}%` : '0%',
              minWidth: '2%'
            }}
          >
            {selectedTest.discIPercentage > 8 && `${selectedTest.discIPercentage}%`}
          </div>
          {/* S - Estável (Verde) */}
          <div 
            className="bg-green-500 flex items-center justify-center text-white text-xs font-bold border-r border-white/20"
            style={{ 
              width: selectedTest.discSPercentage > 0 ? `${selectedTest.discSPercentage}%` : '0%',
              minWidth: '2%'
            }}
          >
            {selectedTest.discSPercentage > 8 && `${selectedTest.discSPercentage}%`}
          </div>
          {/* C - Conforme (Azul) */}
          <div 
            className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ 
              width: selectedTest.discCPercentage > 0 ? `${selectedTest.discCPercentage}%` : '0%',
              minWidth: '2%'
            }}
          >
            {selectedTest.discCPercentage > 8 && `${selectedTest.discCPercentage}%`}
          </div>
        </div>
        <div className="flex justify-between text-xs mt-2 text-gray-700">
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-red-500 rounded"></span>
            <span>Dominante ({selectedTest.discDPercentage}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded"></span>
            <span>Influente ({selectedTest.discIPercentage}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-green-500 rounded"></span>
            <span>Estável ({selectedTest.discSPercentage}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded"></span>
            <span>Conforme ({selectedTest.discCPercentage}%)</span>
          </div>
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