const EmotionalIntelligenceChart = ({ selectedTest, getIEDimensionName, generatingReport }) => {
  if (!selectedTest.detailedResults?.ie) return null;

  return (
    <div className="bg-white shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-white bg-gray-800 px-3 py-2 mb-4">INTELIGÊNCIA EMOCIONAL</h3>
      
      {generatingReport ? (
        // Skeleton loading para Inteligência Emocional
        <div className="animate-pulse">
          {/* Skeleton do gráfico circular */}
          <div className="text-center mb-6">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
          </div>
          
          {/* Skeleton das dimensões */}
          <div className="grid md:grid-cols-1 gap-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="w-32 h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
                  <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
                </div>
                <div className="text-right ml-3">
                  <div className="w-8 h-5 bg-gray-200 rounded mb-1"></div>
                  <div className="w-12 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Skeleton da interpretação */}
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <div className="w-48 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-full h-3 bg-gray-200 rounded mb-1"></div>
            <div className="w-5/6 h-3 bg-gray-200 rounded mb-1"></div>
            <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Gráfico Radar/Estrela Simplificado */}
          <div className="text-center mb-6">
            <div className="inline-block relative">
              <div className="w-32 h-32 rounded-full border-4 border-indigo-200 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {selectedTest.detailedResults.ie.overall}%
                  </div>
                  <div className="text-xs text-gray-600">QI Emocional</div>
                </div>
                
                {/* Indicadores ao redor do círculo */}
                {Object.entries(selectedTest.detailedResults.ie.scores).map(([dimension, score], index) => {
                  const angle = (index * 72) - 90; // 360/5 = 72 graus entre cada ponto
                  const radian = (angle * Math.PI) / 180;
                  const x = Math.cos(radian) * 60;
                  const y = Math.sin(radian) * 60;
                  
                  return (
                    <div
                      key={dimension}
                      className="absolute w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        left: `calc(50% + ${x}px - 12px)`,
                        top: `calc(50% + ${y}px - 12px)`,
                      }}
                    >
                      {score}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detalhamento das dimensões */}
          <div className="grid md:grid-cols-1 gap-3">
            {Object.entries(selectedTest.detailedResults.ie.scores).map(([dimension, score]) => (
              <div key={dimension} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-900">{getIEDimensionName(dimension)}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {dimension === 'autoconsciencia' && 'Capacidade de reconhecer e compreender suas próprias emoções'}
                    {dimension === 'autorregulacao' && 'Habilidade de controlar e gerenciar suas reações emocionais'}
                    {dimension === 'automotivacao' && 'Capacidade de se motivar e manter o foco em objetivos'}
                    {dimension === 'empatia' && 'Habilidade de compreender e sentir as emoções dos outros'}
                    {dimension === 'habilidade_social' && 'Competência para se relacionar e comunicar efetivamente'}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <div className="text-lg font-bold text-indigo-600">{score}%</div>
                  <div className="text-xs text-gray-500">
                    {score >= 70 ? 'Alto' : score >= 40 ? 'Médio' : 'Baixo'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interpretação geral */}
          <div className="mt-4 p-4 bg-indigo-50 rounded">
            <h4 className="text-sm font-semibold text-indigo-900 mb-2">Interpretação do seu QI Emocional</h4>
            <p className="text-xs text-indigo-800 leading-relaxed">
              Com uma pontuação geral de <strong>{selectedTest.detailedResults.ie.overall}%</strong>, você demonstra um 
              {selectedTest.detailedResults.ie.overall >= 70 ? ' alto nível' : 
               selectedTest.detailedResults.ie.overall >= 40 ? ' nível médio' : ' nível em desenvolvimento'} de 
              inteligência emocional. Isso indica sua capacidade de compreender e gerenciar emoções tanto próprias quanto de outras pessoas.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default EmotionalIntelligenceChart;