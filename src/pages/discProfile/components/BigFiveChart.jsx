const BigFiveChart = ({ selectedTest, getBigFiveName, generatingReport }) => {
  if (!selectedTest.detailedResults?.bigFive) return null;

  return (
    <div className="bg-white shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-white bg-gray-800 px-3 py-2 mb-4">PERFIL DE PERSONALIDADE - BIG FIVE</h3>
      
      {generatingReport ? (
        // Skeleton loading para Big Five
        <div className="animate-pulse">
          {/* Skeleton do gráfico */}
          <div className="flex items-end justify-center space-x-6 mb-6 h-40">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex flex-col items-center h-full justify-end">
                <div className="w-4 h-3 bg-gray-200 rounded mb-1"></div>
                <div 
                  className="w-8 bg-gray-200 rounded-t-lg" 
                  style={{ height: `${Math.min(60 + (i * 15), 120)}px` }}
                ></div>
                <div className="mt-2 text-center">
                  <div className="w-4 h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="w-12 h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Skeleton das interpretações */}
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="border border-gray-200 rounded p-3">
                <div className="w-32 h-3 bg-gray-200 rounded mb-2"></div>
                <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
                <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Gráfico de barras vertical */}
          <div className="flex items-end justify-center space-x-6 mb-6 h-40">
            {Object.entries(selectedTest.detailedResults.bigFive.scores).map(([trait, score]) => (
              <div key={trait} className="flex flex-col items-center">
                <div className="text-xs font-semibold text-gray-900 mb-1">{score}%</div>
                <div 
                  className="w-8 bg-gradient-to-t from-orange-400 to-orange-600 rounded-t-lg flex items-end justify-center"
                  style={{ height: `${(score / 100) * 120}px` }}
                >
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs font-bold text-gray-900">{trait}</div>
                  <div className="text-xs text-gray-600">{getBigFiveName(trait)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Interpretação dos resultados */}
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(selectedTest.detailedResults.bigFive.scores).map(([trait, score]) => (
              <div key={trait} className="border border-gray-200 rounded p-3">
                <h4 className="text-xs font-semibold text-gray-900 mb-1">{getBigFiveName(trait)} - {score}%</h4>
                <p className="text-xs text-gray-600">
                  {score >= 70 ? 'Nível Alto' : score >= 40 ? 'Nível Médio' : 'Nível Baixo'} - 
                  {trait === 'O' && ' Interesse em novas experiências e ideias criativas'}
                  {trait === 'C' && ' Organização, disciplina e orientação para objetivos'}
                  {trait === 'E' && ' Energia social, assertividade e busca por estímulos'}
                  {trait === 'A' && ' Cooperação, confiança e consideração pelos outros'}
                  {trait === 'N' && ' Tendência a experimentar emoções negativas'}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BigFiveChart;