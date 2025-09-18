import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Brain, ArrowRight } from "lucide-react";
import { useState } from "react";
import testService from "@/services/testService";

const TesteDISCPage = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 25 perguntas do teste psicológico unificado
  const questions = [
    // DISC - Dominante (D)
    {
      id: 1,
      section: "DISC",
      text: "Em situações de pressão, eu prefiro:",
      options: [
        { id: "a", text: "Tomar decisões rápidas e assumir o controle", disc: "D", bigFive: null, leadership: null },
        { id: "b", text: "Buscar consenso com a equipe", disc: "I", bigFive: null, leadership: null },
        { id: "c", text: "Analisar todas as opções cuidadosamente", disc: "C", bigFive: null, leadership: null },
        { id: "d", text: "Manter a estabilidade e evitar conflitos", disc: "S", bigFive: null, leadership: null }
      ]
    },
    {
      id: 2,
      section: "DISC",
      text: "Quando lidero um projeto, minha abordagem é:",
      options: [
        { id: "a", text: "Definir metas claras e cobrar resultados", disc: "D", bigFive: null, leadership: null },
        { id: "b", text: "Motivar a equipe e criar um ambiente positivo", disc: "I", bigFive: null, leadership: null },
        { id: "c", text: "Estabelecer processos detalhados e padrões", disc: "C", bigFive: null, leadership: null },
        { id: "d", text: "Garantir que todos se sintam confortáveis", disc: "S", bigFive: null, leadership: null }
      ]
    },
    {
      id: 3,
      section: "DISC",
      text: "Diante de um desafio complexo, eu:",
      options: [
        { id: "a", text: "Enfrento de frente e busco soluções diretas", disc: "D", bigFive: null, leadership: null },
        { id: "b", text: "Procuro inspirar outros a se juntarem à solução", disc: "I", bigFive: null, leadership: null },
        { id: "c", text: "Pesquiso e planejo antes de agir", disc: "C", bigFive: null, leadership: null },
        { id: "d", text: "Prefiro abordagens testadas e seguras", disc: "S", bigFive: null, leadership: null }
      ]
    },
    // DISC - Influente (I)
    {
      id: 4,
      section: "DISC",
      text: "Em reuniões de trabalho, eu geralmente:",
      options: [
        { id: "a", text: "Foco nos resultados e próximos passos", disc: "D", bigFive: null, leadership: null },
        { id: "b", text: "Contribuo com ideias criativas e energizo o grupo", disc: "I", bigFive: null, leadership: null },
        { id: "c", text: "Faço perguntas detalhadas e analiso dados", disc: "C", bigFive: null, leadership: null },
        { id: "d", text: "Escuto mais do que falo e apoio as decisões", disc: "S", bigFive: null, leadership: null }
      ]
    },
    {
      id: 5,
      section: "DISC",
      text: "Minha forma preferida de comunicação é:",
      options: [
        { id: "a", text: "Direta e objetiva", disc: "D", bigFive: null, leadership: null },
        { id: "b", text: "Entusiástica e expressiva", disc: "I", bigFive: null, leadership: null },
        { id: "c", text: "Precisa e bem fundamentada", disc: "C", bigFive: null, leadership: null },
        { id: "d", text: "Calma e respeitosa", disc: "S", bigFive: null, leadership: null }
      ]
    },
    {
      id: 6,
      section: "DISC",
      text: "Quando trabalho em equipe, eu:",
      options: [
        { id: "a", text: "Assumo a liderança naturalmente", disc: "D", bigFive: null, leadership: null },
        { id: "b", text: "Motivo e inspiro os colegas", disc: "I", bigFive: null, leadership: null },
        { id: "c", text: "Contribuo com análises e soluções técnicas", disc: "C", bigFive: null, leadership: null },
        { id: "d", text: "Apoio e colaboro harmoniosamente", disc: "S", bigFive: null, leadership: null }
      ]
    },
    // DISC - Estável (S)
    {
      id: 7,
      section: "DISC",
      text: "Minha abordagem para mudanças é:",
      options: [
        { id: "a", text: "Abraço mudanças que tragam resultados rápidos", disc: "D", bigFive: null, leadership: null },
        { id: "b", text: "Vejo mudanças como oportunidades empolgantes", disc: "I", bigFive: null, leadership: null },
        { id: "c", text: "Analiso cuidadosamente os impactos antes de aceitar", disc: "C", bigFive: null, leadership: null },
        { id: "d", text: "Prefiro mudanças graduais e bem planejadas", disc: "S", bigFive: null, leadership: null }
      ]
    },
    {
      id: 8,
      section: "DISC",
      text: "Em conflitos, eu tendo a:",
      options: [
        { id: "a", text: "Confrontar diretamente para resolver rapidamente", disc: "D", bigFive: null, leadership: null },
        { id: "b", text: "Usar humor e persuasão para amenizar a situação", disc: "I", bigFive: null, leadership: null },
        { id: "c", text: "Buscar fatos e dados para mediar", disc: "C", bigFive: null, leadership: null },
        { id: "d", text: "Evitar confrontos e buscar harmonia", disc: "S", bigFive: null, leadership: null }
      ]
    },
    // DISC - Consciente (C)
    {
      id: 9,
      section: "DISC",
      text: "Ao tomar decisões importantes, eu:",
      options: [
        { id: "a", text: "Confio na minha intuição e experiência", disc: "D", bigFive: null, leadership: null },
        { id: "b", text: "Considero o impacto nas pessoas envolvidas", disc: "I", bigFive: null, leadership: null },
        { id: "c", text: "Analiso todos os dados e possíveis cenários", disc: "C", bigFive: null, leadership: null },
        { id: "d", text: "Busco opiniões de pessoas confiáveis", disc: "S", bigFive: null, leadership: null }
      ]
    },
    {
      id: 10,
      section: "DISC",
      text: "Meu ambiente de trabalho ideal é:",
      options: [
        { id: "a", text: "Dinâmico com metas desafiadoras", disc: "D", bigFive: null, leadership: null },
        { id: "b", text: "Colaborativo e criativo", disc: "I", bigFive: null, leadership: null },
        { id: "c", text: "Organizado com processos claros", disc: "C", bigFive: null, leadership: null },
        { id: "d", text: "Estável e harmonioso", disc: "S", bigFive: null, leadership: null }
      ]
    },
    // BIG FIVE - Abertura à Experiência
    {
      id: 11,
      section: "Big Five",
      text: "Eu me considero uma pessoa que:",
      options: [
        { id: "a", text: "Sempre busca novas experiências e ideias", disc: null, bigFive: { O: 4 }, leadership: null },
        { id: "b", text: "Às vezes gosta de novidades, mas com moderação", disc: null, bigFive: { O: 3 }, leadership: null },
        { id: "c", text: "Prefere o que já conhece e funciona bem", disc: null, bigFive: { O: 2 }, leadership: null },
        { id: "d", text: "Evita mudanças desnecessárias", disc: null, bigFive: { O: 1 }, leadership: null }
      ]
    },
    {
      id: 12,
      section: "Big Five",
      text: "Quando enfrento um problema, eu:",
      options: [
        { id: "a", text: "Busco soluções criativas e inovadoras", disc: null, bigFive: { O: 4 }, leadership: null },
        { id: "b", text: "Combino métodos novos com tradicionais", disc: null, bigFive: { O: 3 }, leadership: null },
        { id: "c", text: "Uso abordagens testadas e comprovadas", disc: null, bigFive: { O: 2 }, leadership: null },
        { id: "d", text: "Sigo procedimentos estabelecidos", disc: null, bigFive: { O: 1 }, leadership: null }
      ]
    },
    // BIG FIVE - Conscienciosidade
    {
      id: 13,
      section: "Big Five",
      text: "Em relação a prazos e compromissos, eu:",
      options: [
        { id: "a", text: "Sempre cumpro antes do prazo", disc: null, bigFive: { C: 4 }, leadership: null },
        { id: "b", text: "Geralmente cumpro no prazo", disc: null, bigFive: { C: 3 }, leadership: null },
        { id: "c", text: "Às vezes preciso de lembretes", disc: null, bigFive: { C: 2 }, leadership: null },
        { id: "d", text: "Tenho dificuldade com prazos rígidos", disc: null, bigFive: { C: 1 }, leadership: null }
      ]
    },
    {
      id: 14,
      section: "Big Five",
      text: "Meu espaço de trabalho é:",
      options: [
        { id: "a", text: "Extremamente organizado e limpo", disc: null, bigFive: { C: 4 }, leadership: null },
        { id: "b", text: "Organizado na maior parte do tempo", disc: null, bigFive: { C: 3 }, leadership: null },
        { id: "c", text: "Organizado o suficiente para funcionar", disc: null, bigFive: { C: 2 }, leadership: null },
        { id: "d", text: "Criativo e flexível (nem sempre organizado)", disc: null, bigFive: { C: 1 }, leadership: null }
      ]
    },
    // BIG FIVE - Extroversão
    {
      id: 15,
      section: "Big Five",
      text: "Em eventos sociais, eu:",
      options: [
        { id: "a", text: "Sou o centro das atenções e converso com todos", disc: null, bigFive: { E: 4 }, leadership: null },
        { id: "b", text: "Interajo facilmente mas também observo", disc: null, bigFive: { E: 3 }, leadership: null },
        { id: "c", text: "Converso com algumas pessoas conhecidas", disc: null, bigFive: { E: 2 }, leadership: null },
        { id: "d", text: "Prefiro observar e falar pouco", disc: null, bigFive: { E: 1 }, leadership: null }
      ]
    },
    {
      id: 16,
      section: "Big Five",
      text: "Para recarregar minhas energias, eu prefiro:",
      options: [
        { id: "a", text: "Estar com muitas pessoas e atividades", disc: null, bigFive: { E: 4 }, leadership: null },
        { id: "b", text: "Alternar entre socializar e momentos sozinho", disc: null, bigFive: { E: 3 }, leadership: null },
        { id: "c", text: "Pequenos grupos de pessoas próximas", disc: null, bigFive: { E: 2 }, leadership: null },
        { id: "d", text: "Tempo sozinho ou com uma pessoa especial", disc: null, bigFive: { E: 1 }, leadership: null }
      ]
    },
    // BIG FIVE - Amabilidade
    {
      id: 17,
      section: "Big Five",
      text: "Quando alguém me pede ajuda, eu:",
      options: [
        { id: "a", text: "Sempre ajudo, mesmo que me prejudique", disc: null, bigFive: { A: 4 }, leadership: null },
        { id: "b", text: "Ajudo quando posso e faz sentido", disc: null, bigFive: { A: 3 }, leadership: null },
        { id: "c", text: "Ajudo se não atrapalhar meus planos", disc: null, bigFive: { A: 2 }, leadership: null },
        { id: "d", text: "Avalio se a pessoa realmente merece ajuda", disc: null, bigFive: { A: 1 }, leadership: null }
      ]
    },
    {
      id: 18,
      section: "Big Five",
      text: "Em negociações, minha tendência é:",
      options: [
        { id: "a", text: "Buscar soluções que beneficiem todos", disc: null, bigFive: { A: 4 }, leadership: null },
        { id: "b", text: "Equilibrar meus interesses com os dos outros", disc: null, bigFive: { A: 3 }, leadership: null },
        { id: "c", text: "Focar nos meus objetivos principais", disc: null, bigFive: { A: 2 }, leadership: null },
        { id: "d", text: "Garantir que eu saia ganhando", disc: null, bigFive: { A: 1 }, leadership: null }
      ]
    },
    // BIG FIVE - Neuroticismo
    {
      id: 19,
      section: "Big Five",
      text: "Sob pressão, eu:",
      options: [
        { id: "a", text: "Mantenho a calma e foco na solução", disc: null, bigFive: { N: 1 }, leadership: null },
        { id: "b", text: "Fico um pouco ansioso mas me controlo", disc: null, bigFive: { N: 2 }, leadership: null },
        { id: "c", text: "Sinto bastante estresse mas consigo lidar", disc: null, bigFive: { N: 3 }, leadership: null },
        { id: "d", text: "Fico muito ansioso e tenho dificuldade para focar", disc: null, bigFive: { N: 4 }, leadership: null }
      ]
    },
    {
      id: 20,
      section: "Big Five",
      text: "Quando recebo críticas, eu:",
      options: [
        { id: "a", text: "Aceito facilmente e uso para melhorar", disc: null, bigFive: { N: 1 }, leadership: null },
        { id: "b", text: "Inicialmente me incomodo mas depois reflito", disc: null, bigFive: { N: 2 }, leadership: null },
        { id: "c", text: "Fico defensivo mas tento entender", disc: null, bigFive: { N: 3 }, leadership: null },
        { id: "d", text: "Levo muito para o pessoal e fico abalado", disc: null, bigFive: { N: 4 }, leadership: null }
      ]
    },
    // LIDERANÇA - Autocrático vs Democrático
    {
      id: 21,
      section: "Liderança",
      text: "Quando lidero uma equipe, eu:",
      options: [
        { id: "a", text: "Tomo as decisões e comunico claramente", disc: null, bigFive: null, leadership: { autocratic: 2 } },
        { id: "b", text: "Consulto a equipe mas decido sozinho", disc: null, bigFive: null, leadership: { autocratic: 1 } },
        { id: "c", text: "Decidimos juntos após discussão", disc: null, bigFive: null, leadership: { democratic: 1 } },
        { id: "d", text: "Deixo a equipe decidir e apoio", disc: null, bigFive: null, leadership: { democratic: 2 } }
      ]
    },
    {
      id: 22,
      section: "Liderança",
      text: "Para motivar minha equipe, eu:",
      options: [
        { id: "a", text: "Estabeleço metas claras e monitoro de perto", disc: null, bigFive: null, leadership: { autocratic: 2 } },
        { id: "b", text: "Defino objetivos e dou autonomia para alcançar", disc: null, bigFive: null, leadership: { autocratic: 1 } },
        { id: "c", text: "Trabalho junto com eles nas soluções", disc: null, bigFive: null, leadership: { democratic: 1 } },
        { id: "d", text: "Facilito o processo e removo obstáculos", disc: null, bigFive: null, leadership: { democratic: 2 } }
      ]
    },
    // LIDERANÇA - Transformacional vs Transacional
    {
      id: 23,
      section: "Liderança",
      text: "Minha visão de liderança é:",
      options: [
        { id: "a", text: "Inspirar pessoas a superarem seus limites", disc: null, bigFive: null, leadership: { transformational: 2 } },
        { id: "b", text: "Equilibrar inspiração com recompensas práticas", disc: null, bigFive: null, leadership: { transformational: 1 } },
        { id: "c", text: "Reconhecer bom desempenho com benefícios", disc: null, bigFive: null, leadership: { transactional: 1 } },
        { id: "d", text: "Garantir que as tarefas sejam cumpridas", disc: null, bigFive: null, leadership: { transactional: 2 } }
      ]
    },
    {
      id: 24,
      section: "Liderança",
      text: "Para desenvolver minha equipe, eu:",
      options: [
        { id: "a", text: "Foco no crescimento pessoal e profissional de cada um", disc: null, bigFive: null, leadership: { transformational: 2 } },
        { id: "b", text: "Combino desenvolvimento com resultados", disc: null, bigFive: null, leadership: { transformational: 1 } },
        { id: "c", text: "Ofereço treinamentos quando necessário", disc: null, bigFive: null, leadership: { transactional: 1 } },
        { id: "d", text: "Mantenho foco nas responsabilidades atuais", disc: null, bigFive: null, leadership: { transactional: 2 } }
      ]
    },
    // LIDERANÇA - Servant Leadership
    {
      id: 25,
      section: "Liderança",
      text: "Como líder, meu papel principal é:",
      options: [
        { id: "a", text: "Servir minha equipe e remover obstáculos", disc: null, bigFive: null, leadership: { servant: 2 } },
        { id: "b", text: "Equilibrar as necessidades da equipe e da empresa", disc: null, bigFive: null, leadership: { servant: 1 } },
        { id: "c", text: "Garantir que os objetivos sejam alcançados", disc: null, bigFive: null, leadership: { traditional: 1 } },
        { id: "d", text: "Manter controle e direção clara", disc: null, bigFive: null, leadership: { traditional: 2 } }
      ]
    }
  ];

  const handleAnswer = (selectedOption) => {
    const newResponses = {
      ...responses,
      [currentQuestion]: selectedOption
    };
    setResponses(newResponses);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newResponses);
    }
  };

  const calculateResult = async (responses) => {
    setIsLoading(true);
    
    try {
      // Calcular pontuações DISC
      const discScores = { D: 0, I: 0, S: 0, C: 0 };
      const bigFiveScores = { O: 0, C: 0, E: 0, A: 0, N: 0 };
      const leadershipScores = { 
        autocratic: 0, democratic: 0, 
        transformational: 0, transactional: 0, 
        servant: 0, traditional: 0 
      };

      Object.values(responses).forEach((response, index) => {
        const question = questions[index];
        const option = question.options.find(opt => opt.id === response);
        
        if (option) {
          // DISC
          if (option.disc) {
            discScores[option.disc]++;
          }
          
          // Big Five
          if (option.bigFive) {
            Object.keys(option.bigFive).forEach(trait => {
              bigFiveScores[trait] += option.bigFive[trait];
            });
          }
          
          // Leadership
          if (option.leadership) {
            Object.keys(option.leadership).forEach(style => {
              leadershipScores[style] += option.leadership[style];
            });
          }
        }
      });

      // Calcular percentuais DISC
      const discTotal = Object.values(discScores).reduce((sum, v) => sum + v, 0) || 1;
      const discPercentages = {
        D: Math.round((discScores.D / discTotal) * 100),
        I: Math.round((discScores.I / discTotal) * 100),
        S: Math.round((discScores.S / discTotal) * 100),
        C: Math.round((discScores.C / discTotal) * 100)
      };

      const dominantDiscType = Object.keys(discPercentages).reduce((a, b) =>
        discPercentages[a] > discPercentages[b] ? a : b
      );

      // Calcular percentuais Big Five (média das pontuações por trait)
      const bigFivePercentages = {};
      Object.keys(bigFiveScores).forEach(trait => {
        const count = Object.values(responses).filter((_, index) => {
          const question = questions[index];
          const option = question.options.find(opt => opt.id === responses[index]);
          return option?.bigFive?.[trait];
        }).length;
        
        if (count > 0) {
          bigFivePercentages[trait] = Math.round((bigFiveScores[trait] / count) * 25);
        } else {
          bigFivePercentages[trait] = 50; // Valor neutro
        }
      });

      // Determinar estilo de liderança dominante
      const leadershipStyles = {
        autocratic: leadershipScores.autocratic,
        democratic: leadershipScores.democratic,
        transformational: leadershipScores.transformational,
        transactional: leadershipScores.transactional,
        servant: leadershipScores.servant,
        traditional: leadershipScores.traditional
      };

      const dominantLeadershipStyle = Object.keys(leadershipStyles).reduce((a, b) =>
        leadershipStyles[a] > leadershipStyles[b] ? a : b
      );

      const result = {
        disc: {
          type: dominantDiscType,
          scores: discScores,
          percentages: discPercentages,
          name: getDiscName(dominantDiscType),
          description: getDiscDescription(dominantDiscType),
          characteristics: getDiscCharacteristics(dominantDiscType)
        },
        bigFive: {
          scores: bigFiveScores,
          percentages: bigFivePercentages,
          traits: getBigFiveTraits(bigFivePercentages)
        },
        leadership: {
          dominantStyle: dominantLeadershipStyle,
          scores: leadershipScores,
          description: getLeadershipDescription(dominantLeadershipStyle)
        }
      };

      // Salvar resultado usando a API de testes psicológicos
      console.log("🔍 TesteDISC - Criando teste psicológico para usuário:", user.id);
      
      try {
        // 1. Criar teste psicológico
        const newTest = await testService.createPsychologicalTest(user.id, 'unified');
        console.log("🔍 TesteDISC - Teste criado:", newTest);
        
        const testId = newTest.id;
        
        // 2. Submeter respostas
        const responseData = {
          responses: responses,
          disc_scores: result.disc,
          big_five_scores: result.bigFive,
          leadership_scores: result.leadership
        };
        
        await testService.submitPsychologicalTestResponse(testId, responseData);
        console.log("🔍 TesteDISC - Respostas submetidas");
        
        // 3. Completar teste
        const completedTest = await testService.completePsychologicalTest(testId);
        console.log("✅ TesteDISC - Teste completado:", completedTest);
        
        // Atualizar cache para não mostrar modal DISC novamente
        const cacheKey = `disc_completed_${user.id}`;
        const profileCacheKey = `disc_profile_${user.id}`;
        
        localStorage.setItem(cacheKey, 'true');
        localStorage.setItem(`${cacheKey}_expiry`, (Date.now() + 3600000).toString());
        
        // Salvar o perfil DISC no localStorage para acesso rápido
        localStorage.setItem(profileCacheKey, JSON.stringify(result.disc));
        
        console.log("✅ Cache atualizado - DISC marcado como completado");
        console.log("✅ Perfil DISC salvo no localStorage:", result.disc);
        
        // Disparar evento personalizado para notificar outros componentes
        window.dispatchEvent(new CustomEvent('discTestCompleted', { 
          detail: { userId: user.id, discData: result.disc }
        }));
        
      } catch (error) {
        console.error("❌ TesteDISC - Erro ao salvar resultado:", error);
        
        // Mesmo com erro na API, marcar como completado no cache
        // para evitar que o usuário tenha que refazer o teste
        const cacheKey = `disc_completed_${user.id}`;
        const profileCacheKey = `disc_profile_${user.id}`;
        
        localStorage.setItem(cacheKey, 'true');
        localStorage.setItem(`${cacheKey}_expiry`, (Date.now() + 3600000).toString());
        
        // Salvar o perfil DISC no localStorage mesmo com erro na API
        localStorage.setItem(profileCacheKey, JSON.stringify(result.disc));
        
        console.log("✅ Cache atualizado mesmo com erro de salvamento");
        console.log("✅ Perfil DISC salvo no localStorage:", result.disc);
      }

      setTestResult(result);
      setShowResult(true);
      
    } catch (error) {
      console.error("Erro ao calcular resultado:", error);
      // Mostrar resultado mesmo com erro
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getDiscName = (type) => {
    const names = {
      D: "Dominância",
      I: "Influência", 
      S: "Estabilidade",
      C: "Conformidade"
    };
    return names[type] || "Dominância";
  };

  const getDiscDescription = (type) => {
    const descriptions = {
      D: "Focado em resultados, direto e decidido",
      I: "Comunicativo, otimista e persuasivo",
      S: "Leal, paciente e cooperativo", 
      C: "Analítico, preciso e organizado"
    };
    return descriptions[type] || descriptions.D;
  };

  const getDiscCharacteristics = (type) => {
    const characteristics = {
      D: [
        "Orientado para resultados",
        "Toma decisões rapidamente",
        "Gosta de desafios",
        "Prefere liderar",
        "Direto na comunicação"
      ],
      I: [
        "Excelente comunicador",
        "Otimista e entusiástico",
        "Gosta de trabalhar com pessoas",
        "Criativo e inovador",
        "Motivador natural"
      ],
      S: [
        "Confiável e leal",
        "Trabalha bem em equipe",
        "Paciente e compreensivo",
        "Busca harmonia",
        "Estável e consistente"
      ],
      C: [
        "Atento aos detalhes",
        "Analítico e lógico",
        "Organizado e sistemático",
        "Busca qualidade",
        "Cauteloso nas decisões"
      ]
    };
    return characteristics[type] || characteristics.D;
  };

  const getBigFiveTraits = (percentages) => {
    return {
      openness: {
        level: getTraitLevel(percentages.O),
        description: percentages.O > 75 ? "Muito criativo e aberto a novas experiências" :
                    percentages.O > 50 ? "Equilibrio entre tradição e inovação" :
                    percentages.O > 25 ? "Prefere abordagens conhecidas" :
                    "Conservador e tradicional"
      },
      conscientiousness: {
        level: getTraitLevel(percentages.C),
        description: percentages.C > 75 ? "Extremamente organizado e responsável" :
                    percentages.C > 50 ? "Bem organizado na maioria das situações" :
                    percentages.C > 25 ? "Organização moderada" :
                    "Mais flexível com organização"
      },
      extraversion: {
        level: getTraitLevel(percentages.E),
        description: percentages.E > 75 ? "Muito sociável e energizado por pessoas" :
                    percentages.E > 50 ? "Equilibrio entre socializar e introspecção" :
                    percentages.E > 25 ? "Prefere grupos menores" :
                    "Mais introspectivo e reservado"
      },
      agreeableness: {
        level: getTraitLevel(percentages.A),
        description: percentages.A > 75 ? "Muito cooperativo e empático" :
                    percentages.A > 50 ? "Equilibrado entre cooperação e assertividade" :
                    percentages.A > 25 ? "Moderadamente competitivo" :
                    "Mais focado nos próprios objetivos"
      },
      neuroticism: {
        level: getTraitLevel(100 - percentages.N), // Invertido para estabilidade emocional
        description: percentages.N < 25 ? "Muito estável emocionalmente" :
                    percentages.N < 50 ? "Boa estabilidade emocional" :
                    percentages.N < 75 ? "Moderadamente sensível ao estresse" :
                    "Mais sensível a situações estressantes"
      }
    };
  };

  const getTraitLevel = (percentage) => {
    if (percentage > 75) return "Alto";
    if (percentage > 50) return "Médio-Alto";
    if (percentage > 25) return "Médio-Baixo";
    return "Baixo";
  };

  const getLeadershipDescription = (style) => {
    const descriptions = {
      autocratic: "Líder que toma decisões de forma centralizada e diretiva",
      democratic: "Líder que envolve a equipe nas decisões e busca consenso",
      transformational: "Líder que inspira e motiva através de uma visão compartilhada",
      transactional: "Líder que foca em recompensas e cumprimento de tarefas",
      servant: "Líder que serve à equipe e foca no desenvolvimento dos outros",
      traditional: "Líder que mantém estruturas hierárquicas tradicionais"
    };
    return descriptions[style] || descriptions.traditional;
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getSectionColor = (section) => {
    switch(section) {
      case "DISC": return "bg-blue-600";
      case "Big Five": return "bg-green-600";
      case "Liderança": return "bg-purple-600";
      default: return "bg-gray-600";
    }
  };

  if (showResult && testResult) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center">
          <button 
            onClick={() => navigate("/dashboard")}
            className="text-white flex items-center space-x-2 hover:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </button>
          <h1 className="text-white text-xl font-bold ml-6">Resultado do Teste Psicológico</h1>
        </div>

        {/* Results Content */}
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Teste Concluído!</h2>
            <p className="text-gray-300">Aqui estão os resultados do seu perfil psicológico completo</p>
          </div>

          {/* DISC Results */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Perfil DISC</h3>
            <div className="flex items-center mb-4">
              <div 
                className="h-8 bg-blue-600 rounded-l flex items-center justify-center text-white font-bold text-sm"
                style={{ width: `${testResult.disc.percentages[testResult.disc.type]}%`, minWidth: '60px' }}
              >
                {testResult.disc.type} - {testResult.disc.percentages[testResult.disc.type]}%
              </div>
            </div>
            <h4 className="text-xl font-semibold mb-2">{testResult.disc.name}</h4>
            <p className="text-gray-300 mb-4">{testResult.disc.description}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold mb-2">Características:</h5>
                <ul className="space-y-1 text-sm">
                  {testResult.disc.characteristics.map((char, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Distribuição DISC:</h5>
                <div className="space-y-2 text-sm">
                  {Object.entries(testResult.disc.percentages).map(([type, percentage]) => (
                    <div key={type} className="flex justify-between">
                      <span>{getDiscName(type)}:</span>
                      <span>{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Big Five Results */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold mb-4 text-green-400">Big Five</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(testResult.bigFive.traits).map(([trait, data]) => (
                <div key={trait} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold capitalize">{trait === 'openness' ? 'Abertura' : 
                                                              trait === 'conscientiousness' ? 'Conscienciosidade' :
                                                              trait === 'extraversion' ? 'Extroversão' :
                                                              trait === 'agreeableness' ? 'Amabilidade' : 'Estabilidade Emocional'}</h4>
                    <span className="text-green-400 font-bold">{data.level}</span>
                  </div>
                  <p className="text-sm text-gray-300">{data.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leadership Results */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold mb-4 text-purple-400">Estilo de Liderança</h3>
            <div className="bg-gray-700 p-4 rounded">
              <h4 className="font-semibold mb-2 capitalize">{testResult.leadership.dominantStyle}</h4>
              <p className="text-gray-300">{testResult.leadership.description}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/dashboard")}
            className="text-white flex items-center space-x-2 hover:text-gray-300 mr-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <Brain className="w-6 h-6 mr-2" />
          <h1 className="text-xl font-bold">Teste Psicológico Unificado</h1>
        </div>
        <div className="text-sm">
          {currentQuestion + 1} de {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-700 h-2">
        <div 
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Section Badge */}
          <div className="text-center mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getSectionColor(questions[currentQuestion].section)} text-white`}>
              {questions[currentQuestion].section}
            </span>
          </div>

          {/* Question */}
          <div className="bg-gray-800 rounded-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {questions[currentQuestion].text}
            </h2>

            {/* Options */}
            <div className="space-y-4">
              {questions[currentQuestion].options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 border border-gray-600 hover:border-gray-500"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 border-2 border-gray-400 rounded mr-4 flex items-center justify-center text-sm font-bold">
                      {option.id.toUpperCase()}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-gray-400 text-sm">
            <p>Escolha a opção que melhor descreve você na maioria das situações</p>
            <p className="mt-2">Tempo estimado restante: {Math.ceil((questions.length - currentQuestion - 1) * 0.3)} minutos</p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Calculando seus resultados...</p>
            <p className="text-sm text-gray-400 mt-2">Isso pode levar alguns segundos</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TesteDISCPage;