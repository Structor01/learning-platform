import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import testService from "@/services/testService"; // Fallback para API antiga
import discApiService from "@/services/discApi"; // Nova API DISC
import { ArrowLeft, Calendar, Download } from "lucide-react";

const DISCProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [disc, setDiscProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NOVA FUNCIONALIDADE: Seleção de datas (igual sistema antigo)
  const [tests, setTests] = useState([]); // Lista de testes do usuário
  const [selectedTestId, setSelectedTestId] = useState(null); // Teste selecionado
  const [showReport, setShowReport] = useState(false); // Só mostra relatório se teste selecionado

  // Funções auxiliares para DISC (mantidas do seu código original)
  const getDiscName = (type) => {
    const names = {
      'D': 'Dominante',
      'I': 'Influente',
      'S': 'Estável',
      'C': 'Consciencioso'
    };
    return names[type] || 'Dominante';
  };

  const getDiscDescription = (type) => {
    const descriptions = {
      'D': 'As pessoas com o perfil Dominante são orientadas para resultados, diretas e determinadas. São líderes naturais que gostam de desafios, assumem riscos calculados e tomam decisões rápidas. Têm uma forte necessidade de controle e autonomia, e são motivadas por conquistas e competições. Geralmente são assertivas, confiantes e focadas em alcançar objetivos de forma eficiente.',
      'I': 'As pessoas com o perfil Influente são extrovertidas, gostam de interagir com os outros, de estar no centro das atenções e são altamente comunicativas. Possuem uma forte habilidade social, geralmente gostam de fazer amizades e se conectar com as pessoas. São amigáveis, simpáticas e têm facilidade para estabelecer relações interpessoais. Têm a capacidade de convencer e persuadir outras pessoas, muitas vezes usando técnicas de argumentação e influência.',
      'S': 'As pessoas com o perfil Estável são pacientes, leais e colaborativas. Valorizam a harmonia no ambiente de trabalho, são excelentes ouvintes e preferem ambientes previsíveis e estáveis. São confiáveis, cooperativas e trabalham bem em equipe. Têm uma abordagem consistente ao trabalho e preferem mudanças graduais em vez de transformações bruscas.',
      'C': 'As pessoas com o perfil Consciencioso são analíticas, precisas e sistemáticas. Prezam pela qualidade, seguem procedimentos e são muito detalhistas. Valorizam a exatidão, a organização e têm altos padrões de qualidade. São cautelosas na tomada de decisões, preferem ter todas as informações antes de agir e trabalham de forma metódica e estruturada.'
    };
    return descriptions[type] || descriptions['D'];
  };

  // Outras funções auxiliares (mantidas do seu código...)
  const getDiscCharacteristics = (type) => {
    const characteristics = {
      'D': ['Determinado', 'Competitivo', 'Direto', 'Orientado a resultados', 'Confiante', 'Decisivo'],
      'I': ['Entusiástico', 'Comunicativo', 'Otimista', 'Persuasivo', 'Sociável', 'Inspirador'],
      'S': ['Paciente', 'Leal', 'Colaborativo', 'Estável', 'Confiável', 'Empático'],
      'C': ['Analítico', 'Preciso', 'Sistemático', 'Detalhista', 'Organizado', 'Criterioso']
    };
    return characteristics[type] || characteristics['D'];
  };

  const getDiscStrengths = (type) => {
    const strengths = {
      'D': ['Liderança natural', 'Tomada de decisão rápida', 'Orientação para resultados', 'Iniciativa', 'Competitividade saudável'],
      'I': ['Comunicação eficaz', 'Motivação de equipes', 'Networking', 'Criatividade', 'Otimismo contagiante'],
      'S': ['Trabalho em equipe', 'Estabilidade emocional', 'Lealdade', 'Paciência', 'Resolução de conflitos'],
      'C': ['Análise detalhada', 'Qualidade no trabalho', 'Organização', 'Planejamento', 'Precisão técnica']
    };
    return strengths[type] || strengths['D'];
  };

  const getDiscImprovements = (type) => {
    const improvements = {
      'D': ['Desenvolver paciência', 'Melhorar escuta ativa', 'Considerar opinião da equipe', 'Controlar impulsividade'],
      'I': ['Focar nos detalhes', 'Melhorar organização', 'Cumprir prazos', 'Ser mais analítico'],
      'S': ['Tomar iniciativa', 'Aceitar mudanças', 'Expressar opiniões', 'Ser mais assertivo'],
      'C': ['Ser mais flexível', 'Melhorar relacionamento interpessoal', 'Aceitar riscos calculados', 'Comunicar-se mais']
    };
    return improvements[type] || improvements['D'];
  };

  // NOVA FUNCIONALIDADE: Carregar testes do usuário
  useEffect(() => {
    const loadUserTests = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        console.log('🔍 DISCProfilePage - Carregando testes do usuário:', user.id);

        // Primeiro tentar a nova API DISC
        try {
          const discTests = await discApiService.getUserDISCTests(user.id);
          if (discTests && discTests.length > 0) {
            console.log('✅ DISCProfilePage - Testes DISC encontrados na nova API:', discTests);

            // Mapear testes da nova API para formato esperado
            const formattedTests = discTests.map(test => ({
              id: test.id,
              created_at: test.created_at || test.createdAt,
              perfil_disc: test.perfil || test.profile,
              is_active: test.is_active !== false,
              test_type: 'disc'
            }));

            setTests(formattedTests);

            // Verificar se há parâmetro na URL para auto-seleção
            const urlParams = new URLSearchParams(window.location.search);
            const testId = urlParams.get('teste_id');
            if (testId && formattedTests.length > 0) {
              const testIdNum = parseInt(testId);
              const foundTest = formattedTests.find(test => test.id === testIdNum);
              if (foundTest) {
                setSelectedTestId(testIdNum);
                setShowReport(true);
              }
            }

            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn('⚠️ DISCProfilePage - Nova API não disponível, tentando API antiga:', apiError);
        }

        // Fallback: Usar testService existente (API antiga)
        const response = await testService.getUserPsychologicalTests(user.id, {
          status: 'completed',
          limit: 50
        });

        console.log('🔍 DISCProfilePage - Resposta da API antiga:', response);

        // Filtrar apenas testes DISC - com logs detalhados para debug
        const allTests = response.tests || [];
        console.log('Todos os testes encontrados:', allTests);
        console.log('Quantidade total de testes:', allTests.length);

        // Log detalhado de cada teste para entender a estrutura
        allTests.forEach((test, index) => {
          console.log(`Teste ${index}:`, {
            id: test.id,
            test_type: test.test_type,
            type: test.type,
            hasResultDisc: !!test.result?.disc,
            perfil_disc: test.perfil_disc,
            created_at: test.created_at
          });
        });

        // Filtrar de forma mais permissiva
        const discTests = allTests.filter(test => {
          const isDiscByType = test.test_type === 'disc' || test.type === 'disc';
          const hasDiscResult = !!test.result?.disc;
          const hasPerfilDisc = !!test.perfil_disc;
          const hasDiscScores = !!test.disc_scores;

          console.log(`Teste ${test.id} - DISC check:`, {
            isDiscByType,
            hasDiscResult,
            hasPerfilDisc,
            hasDiscScores,
            willInclude: isDiscByType || hasDiscResult || hasPerfilDisc || hasDiscScores
          });

          return isDiscByType || hasDiscResult || hasPerfilDisc || hasDiscScores;
        });

        console.log('Testes DISC filtrados:', discTests);

        // Mapear para formato esperado
        const formattedTests = discTests.map(test => ({
          id: test.id,
          created_at: test.created_at || test.createdAt,
          perfil_disc: test.result?.disc?.perfil || test.perfil_disc,
          is_active: test.is_active !== false,
          test_type: test.test_type || test.type
        }));

        console.log('Testes formatados:', formattedTests);
        setTests(formattedTests);

        // Se há parâmetro na URL, selecionar automaticamente
        const urlParams = new URLSearchParams(window.location.search);
        const testId = urlParams.get('teste_id');
        if (testId && formattedTests.length > 0) {
          const testIdNum = parseInt(testId);
          const foundTest = formattedTests.find(test => test.id === testIdNum);
          if (foundTest) {
            setSelectedTestId(testIdNum);
            setShowReport(true);
          }
        }

      } catch (err) {
        console.error('Erro ao carregar testes:', err);
        setError('Erro ao carregar testes do usuário');
      } finally {
        setLoading(false);
      }
    };

    loadUserTests();
  }, [user?.id]);

  // Método auxiliar para extrair tipo DISC do perfil textual
  const extractDiscType = (perfilDisc) => {
    if (!perfilDisc) return 'D';

    const perfilLower = perfilDisc.toLowerCase();
    if (perfilLower.includes('dominante')) return 'D';
    if (perfilLower.includes('influente')) return 'I';
    if (perfilLower.includes('estável') || perfilLower.includes('estavel')) return 'S';
    if (perfilLower.includes('conforme') || perfilLower.includes('consciencioso')) return 'C';

    return 'D';
  };

  // NOVA FUNCIONALIDADE: Carregar dados do teste selecionado
  useEffect(() => {
    const loadTestData = async () => {
      if (!selectedTestId || !user?.id) {
        setDiscProfile(null);
        setShowReport(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 DISCProfilePage - Carregando dados do teste:', selectedTestId);

        // Primeiro tentar buscar da nova API DISC
        try {
          const testData = await discApiService.getDISCTestById(selectedTestId);
          if (testData) {
            console.log('✅ DISCProfilePage - Dados do teste da nova API:', testData);

            // Processar dados da nova API
            let discType = 'D';
            let perfilDisc = null;

            if (testData.perfil || testData.profile) {
              perfilDisc = testData.perfil || testData.profile;
              discType = extractDiscType(perfilDisc);
            } else if (testData.result?.disc?.perfil) {
              perfilDisc = testData.result.disc.perfil;
              discType = extractDiscType(perfilDisc);
            }

            const discProfile = {
              type: discType,
              name: getDiscName(discType),
              description: getDiscDescription(discType),
              percentage: 75,
              characteristics: getDiscCharacteristics(discType),
              strengths: getDiscStrengths(discType),
              improvements: getDiscImprovements(discType)
            };

            console.log('✅ DISCProfilePage - Perfil montado da nova API:', discProfile);
            setDiscProfile(discProfile);
            setShowReport(true);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn('⚠️ DISCProfilePage - Erro na nova API, tentando API antiga:', apiError);
        }

        // Fallback: Usar testService existente (API antiga)
        const testData = await testService.getPsychologicalTestResult(selectedTestId);
        console.log('🔍 DISCProfilePage - Dados do teste da API antiga:', testData);

        if (testData) {
          let discType = 'D';
          let perfilDisc = null;

          // Extrair dados do DISC de diferentes formatos possíveis
          if (testData.result?.disc?.perfil) {
            perfilDisc = testData.result.disc.perfil;
            discType = extractDiscType(perfilDisc);
          } else if (testData.perfil_disc) {
            perfilDisc = testData.perfil_disc;
            discType = extractDiscType(perfilDisc);
          } else if (testData.result?.disc_scores?.type) {
            discType = testData.result.disc_scores.type;
          }

          // Se ainda não tem dados, tentar buscar do perfil geral do usuário
          if (!perfilDisc) {
            console.log('Tentando buscar perfil DISC geral do usuário...');
            const userDiscResult = await testService.getUserDISCResult(user.id);
            console.log('Perfil DISC do usuário:', userDiscResult);

            if (userDiscResult && userDiscResult.disc_scores) {
              const discScores = typeof userDiscResult.disc_scores === 'string'
                ? JSON.parse(userDiscResult.disc_scores)
                : userDiscResult.disc_scores;

              if (discScores.type) {
                discType = discScores.type;
              }
            }
          }

          console.log('Tipo DISC extraído:', discType);

          const discProfile = {
            type: discType,
            name: getDiscName(discType),
            description: getDiscDescription(discType),
            percentage: 75, // Pode ser calculado se tiver dados
            characteristics: getDiscCharacteristics(discType),
            strengths: getDiscStrengths(discType),
            improvements: getDiscImprovements(discType)
          };

          console.log('Perfil DISC montado:', discProfile);
          setDiscProfile(discProfile);
          setShowReport(true);

        } else {
          console.warn('Nenhum dado retornado para o teste');
          setError('Dados do teste não encontrados');
        }

      } catch (err) {
        console.error('Erro ao carregar dados do teste:', err);
        setError('Erro ao carregar dados do teste');
      } finally {
        setLoading(false);
      }
    };

    if (selectedTestId) {
      loadTestData();
    }
  }, [selectedTestId, user?.id]);

  // NOVA FUNCIONALIDADE: Handler para pesquisar (igual sistema antigo)
  const handleTestSelection = () => {
    const selectElement = document.getElementById('data_teste');
    const testId = selectElement.value;

    if (testId) {
      setSelectedTestId(parseInt(testId));

      // Atualizar URL como no sistema antigo
      const newUrl = `${window.location.pathname}?teste_id=${testId}`;
      window.history.pushState({}, '', newUrl);
    } else {
      setSelectedTestId(null);
      setShowReport(false);

      // Limpar URL
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-all duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="hidden sm:inline font-medium">Voltar ao Dashboard</span>
              <span className="sm:hidden font-medium">Voltar</span>
            </button>

            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Meus Relatórios
              </h1>
            </div>

            {selectedTestId && (
              <button
                onClick={() => window.open(`/relatorio?teste_id=${selectedTestId}`, '_blank')}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Modo Impressão</span>
              </button>
            )}

            <div className="w-20 sm:w-24"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

        {/* NOVA SEÇÃO: Seletor de Data do Teste (igual sistema antigo) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label htmlFor="data_teste" className="block text-sm font-medium text-gray-700 mb-2">
                Selecione a data do teste
              </label>
              <select
                id="data_teste"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={selectedTestId || ''}
                onChange={(e) => setSelectedTestId(e.target.value ? parseInt(e.target.value) : null)}
                disabled={!tests.length}
              >
                <option value="">Selecione a data do teste</option>
                {tests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {new Date(test.created_at).toLocaleDateString('pt-BR')}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleTestSelection}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              disabled={!selectedTestId}
            >
              Pesquisar
            </button>
          </div>
        </div>

        {/* Mostrar relatório apenas se teste selecionado (igual sistema antigo) */}
        {showReport && disc ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gray-50 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Meu relatório</h2>
              <p className="text-gray-600">Visualize o relatório gerado com base no seu teste de perfil comportamental</p>
            </div>

            {/* Todo o conteúdo do relatório (mantido do seu código original) */}
            <div className="space-y-8 p-6">

              {/* Header do Relatório */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">RELATÓRIO AGROSKILLS</h1>
                    <p className="text-emerald-100">METODOLOGIA DISC | ANÁLISE COMPORTAMENTAL</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-emerald-200 mb-1">Data do Relatório</div>
                    <div className="text-lg font-semibold">{new Date().toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
              </div>

              {/* Perfil Principal */}
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6">Seu Perfil DISC: {disc.name}</h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {disc.type}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        Perfil Comportamental: {disc.name}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {disc.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Características */}
              <div className="p-8 bg-gray-50">
                <h3 className="text-xl font-bold mb-6">Características Principais</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {disc.characteristics?.map((characteristic, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                      <span className="text-gray-800 font-medium">{characteristic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pontos Fortes e Melhorias */}
              <div className="grid md:grid-cols-2 gap-8 p-8">
                <div>
                  <h3 className="text-xl font-bold mb-6 text-green-700">Pontos Fortes</h3>
                  <div className="space-y-3">
                    {disc.strengths?.map((strength, index) => (
                      <div key={index} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-800">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-6 text-orange-700">Áreas de Desenvolvimento</h3>
                  <div className="space-y-3">
                    {disc.improvements?.map((improvement, index) => (
                      <div key={index} className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        <span className="text-gray-800">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Estado sem teste selecionado (igual sistema antigo) */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Selecione um teste</h3>
            <p className="text-gray-600">
              Escolha uma data de teste acima para visualizar seu relatório DISC completo.
            </p>
            {tests.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={() => navigate('/teste-disc')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
                >
                  Fazer Primeiro Teste DISC
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DISCProfilePage;