import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import discApiService from "@/services/testDiscService/discApi"; 
import aiReportService from "@/services/testDiscService/aiReportService";
import { useAuth } from "@/contexts/AuthContext";

// Importar componentes modulares
import {
  Header,
  TestSelector,
  LoadingIndicator,
  EmptyState,
  ReportHeader,
  CharacteristicsSection,
  StrengthsSection,
  DevelopmentAreasSection,
  CommunicationSection,
  WorkEnvironmentSection,
  BigFiveChart,
  EmotionalIntelligenceChart,
  CareerRecommendationsSection,
  ActionButtons,
  DetailedAIReport
} from './components';


const DISCProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  console.log('Tests:', tests);
  console.log('Selected test:', selectedTest);

  // Função para buscar dados do teste
  const fetchTestData = async (userid) => {
    setLoading(true);
    try {
      const response = await discApiService.getUserDISCTests(userid);
      setTests(response);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setLoading(false);
    }
  };

  // Função para selecionar e exibir teste específico
  const handleTestSelection = async (testId) => {
    const test = tests.find(t => t.id === parseInt(testId));
    
    // Limpar estado anterior
    setAiReport(null);
    setSelectedTest(test);
    setSelectedTestId(testId);
    
    // Gera o relatório IA automaticamente quando um teste é selecionado
    if (test && user) {
      setGeneratingReport(true);
      try {
        const report = await aiReportService.generateDetailedReport(test, {
          name: user?.name,
          profession: user?.profession || ''
        });
        setAiReport(report);
      } catch (error) {
        console.error('Erro ao gerar relatório automático:', error);
        // Fallback para relatório básico em caso de erro
        const basicReport = aiReportService.generateBasicReport(test);
        setAiReport(basicReport);
      } finally {
        setGeneratingReport(false);
      }
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTestData(user.id);
    }
  }, [user?.id]);

  // Função para obter nome do perfil DISC
  const getDiscProfileName = (type) => {
    const names = {
      'D': 'Dominante',
      'I': 'Influente', 
      'S': 'Estável',
      'C': 'Consciencioso'
    };
    return names[type] || 'Desconhecido';
  };

  // Função para obter nome das dimensões Big Five
  const getBigFiveName = (trait) => {
    const names = {
      'O': 'Abertura à Experiência',
      'C': 'Conscienciosidade',
      'E': 'Extroversão', 
      'A': 'Amabilidade',
      'N': 'Neuroticismo'
    };
    return names[trait] || trait;
  };

  // Função para obter nome das dimensões IE
  const getIEDimensionName = (dimension) => {
    const names = {
      'autoconsciencia': 'Autoconsciência',
      'autorregulacao': 'Autorregulação',
      'automotivacao': 'Automotivação',
      'empatia': 'Empatia',
      'habilidade_social': 'Habilidade Social'
    };
    return names[dimension] || dimension.replace('_', ' ');
  };

  // Função para obter pontos fortes por perfil (100% IA)
  const getProfileStrengths = () => {
    // Retorna dados da IA se disponível
    if (aiReport?.structuredData?.pontosFortes?.length > 0) {
      return aiReport.structuredData.pontosFortes;
    }

    // Se não tiver IA, retorna array vazio para mostrar estado de carregamento
    return [];
  };

  // Função para obter áreas de desenvolvimento por perfil (100% IA)
  const getProfileDevelopmentAreas = () => {
    // Retorna dados da IA se disponível
    if (aiReport?.structuredData?.areasDesenvolvimento?.length > 0) {
      return aiReport.structuredData.areasDesenvolvimento;
    }

    // Se não tiver IA, retorna array vazio
    return [];
  };

  // Função para obter estilo de comunicação por perfil (100% IA)
  const getCommunicationStyle = () => {
    // Retorna dados da IA se disponível
    if (aiReport?.structuredData?.comunicacao?.howYouCommunicate?.length > 0) {
      return aiReport.structuredData.comunicacao;
    }

    // Se não tiver IA, retorna estrutura vazia
    return { howYouCommunicate: [], howOthersShouldCommunicate: [] };
  };

  // Função para obter ambiente de trabalho ideal por perfil (100% IA)
  const getIdealWorkEnvironment = () => {
    // Retorna dados da IA se disponível
    if (aiReport?.structuredData?.ambiente?.ideal?.length > 0) {
      return aiReport.structuredData.ambiente;
    }

    // Se não tiver IA, retorna estrutura vazia
    return { ideal: [], avoid: [] };
  };

  // Função para obter recomendações de carreira por perfil (100% IA)
  const getCareerRecommendations = () => {
    // Retorna dados da IA se disponível
    if (aiReport?.structuredData?.carreira?.length > 0) {
      return aiReport.structuredData.carreira;
    }

    // Se não tiver IA, retorna array vazio
    return [];
  };

  // Função para gerar relatório com IA
  const generateAIReport = async () => {
    if (!selectedTest) return;
    
    setGeneratingReport(true);
    try {
      const report = await aiReportService.generateDetailedReport(selectedTest, {
        name: user?.name,
        profession: user?.profession || ''
      });
      setAiReport(report);

      console.log('AI Report:', report);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      // Fallback para relatório básico
      const basicReport = aiReportService.generateBasicReport(selectedTest);
      setAiReport(basicReport);
    } finally {
      setGeneratingReport(false);
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
      <Header onBack={() => navigate('/dashboard')} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Seletor de teste */}
        <TestSelector 
          tests={tests}
          selectedTestId={selectedTestId}
          onTestSelection={handleTestSelection}
          loading={loading}
        />

        {/* Indicador de Geração de Relatório IA */}
        {generatingReport && <LoadingIndicator />}

        {/* Resultados do teste selecionado */}
        {selectedTest ? (
          <div className="space-y-1">
            {/* Cabeçalho do Relatório */}
            <ReportHeader 
              selectedTest={selectedTest}
              user={user}
              getDiscProfileName={getDiscProfileName}
            />

            {/* Características Gerais */}
            <CharacteristicsSection 
              aiReport={aiReport}
              generatingReport={generatingReport}
            />

            {/* Pontos Fortes */}
            <StrengthsSection 
              strengths={getProfileStrengths()}
              aiReport={aiReport}
              generatingReport={generatingReport}
            />

            {/* Áreas de Desenvolvimento */}
            <DevelopmentAreasSection 
              developmentAreas={getProfileDevelopmentAreas()}
              aiReport={aiReport}
              generatingReport={generatingReport}
            />

            {/* Estilo de Comunicação */}
            <CommunicationSection 
              communicationStyle={getCommunicationStyle()}
              aiReport={aiReport}
              generatingReport={generatingReport}
            />

            {/* Ambiente de Trabalho Ideal */}
            <WorkEnvironmentSection 
              workEnvironment={getIdealWorkEnvironment()}
              aiReport={aiReport}
              generatingReport={generatingReport}
            />

            {/* Big Five Chart */}
            <BigFiveChart 
              selectedTest={selectedTest}
              getBigFiveName={getBigFiveName}
              generatingReport={generatingReport}
            />

            {/* Emotional Intelligence Chart */}
            <EmotionalIntelligenceChart 
              selectedTest={selectedTest}
              getIEDimensionName={getIEDimensionName}
              generatingReport={generatingReport}
            />

            {/* Recomendações de Carreira */}
            <CareerRecommendationsSection 
              careerRecommendations={getCareerRecommendations()}
              aiReport={aiReport}
              generatingReport={generatingReport}
            />

            {/* Botões de Ação */}
            <ActionButtons 
              aiReport={aiReport}
              generatingReport={generatingReport}
              onGenerateReport={generateAIReport}
              onNewTest={() => navigate('/teste-disc')}
            />

            {/* Relatório IA Detalhado */}
            <DetailedAIReport aiReport={aiReport} />
          </div>
        ) : (
          /* Estado sem teste selecionado */
          <EmptyState 
            tests={tests}
            onNewTest={() => navigate('/teste-disc')}
          />
        )}
      </div>
    </div>
  );
};

export default DISCProfilePage;