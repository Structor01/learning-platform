import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import testService from "@/services/testService"; // Fallback para API antiga
import discApiService from "@/services/discApi"; // Nova API DISC
import { ArrowLeft, Calendar, Download } from "lucide-react";
import { RelatorioCompleto } from '../components/ui/RelatorioCompleto';
import PremiumFeature from '@/components/ui/PremiumFeature';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


const DISCProfilePage = () => {
  const { user, PREMIUM_FEATURES, canAccessFeature } = useAuth();
  const navigate = useNavigate();
  const [disc, setDiscProfile] = useState(null);
  const [inteligenciaEmocional, setInteligenciaEmocional] = useState(null);
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

  const pdfAutoTablee = () => {
    return pdfAutoTablee
  }

  // Outras funções auxiliares (mantidas do seu código...)
  const getDiscCharacteristics = (type) => {
    const characteristics = {
      'D': [
        'Determinado e focado em alcançar objetivos desafiadores, mesmo diante de obstáculos significativos',
        'Competitivo por natureza, sempre buscando superar metas e se destacar em suas atividades profissionais',
        'Direto e franco na comunicação, preferindo abordar questões de forma clara e sem rodeios',
        'Orientado a resultados, priorizando a eficiência e a produtividade em todas as suas tarefas',
        'Confiante em suas habilidades e decisões, demonstrando segurança ao liderar projetos e equipes',
        'Decisivo na tomada de decisões, conseguindo avaliar rapidamente as situações e agir de forma assertiva'
      ],
      'I': [
        'Entusiástico e energético, trazendo motivação e positividade para o ambiente de trabalho',
        'Comunicativo e expressivo, possuindo facilidade natural para se relacionar com pessoas de diferentes perfis',
        'Otimista e esperançoso, mantendo uma perspectiva positiva mesmo em situações desafiadoras',
        'Persuasivo e influente, capaz de convencer e inspirar outros através de suas ideias e argumentos',
        'Sociável e carismático, criando facilmente conexões pessoais e profissionais duradouras',
        'Inspirador e motivador, conseguindo energizar equipes e promover um ambiente colaborativo'
      ],
      'S': [
        'Paciente e perseverante, mantendo a calma e a consistência mesmo em situações de pressão',
        'Leal e confiável, demonstrando compromisso duradouro com pessoas, projetos e organizações',
        'Colaborativo e cooperativo, trabalhando efetivamente em equipe e apoiando colegas quando necessário',
        'Estável e equilibrado, proporcionando segurança e previsibilidade em suas ações e comportamentos',
        'Confiável e responsável, cumprindo consistentemente compromissos e entregando resultados conforme acordado',
        'Empático e compreensivo, demonstrando sensibilidade às necessidades e sentimentos dos outros'
      ],
      'C': [
        'Analítico e reflexivo, examinando cuidadosamente informações antes de formar conclusões ou tomar decisões',
        'Preciso e exato, mantendo altos padrões de qualidade e atenção meticulosa aos detalhes em seu trabalho',
        'Sistemático e metodológico, seguindo processos estruturados e organizados para maximizar a eficiência',
        'Detalhista e minucioso, identificando aspectos que outros podem negligenciar e garantindo completude nas tarefas',
        'Organizado e estruturado, mantendo sistemas claros e ordenados para gerenciar informações e responsabilidades',
        'Criterioso e cuidadoso, avaliando todas as opções disponíveis antes de proceder com qualquer ação importante'
      ]
    };
    return characteristics[type] || characteristics['D'];
  };

  const getDiscStrengths = (type) => {
    const strengths = {
      'D': [
        'Liderança natural e capacidade innata de assumir o comando de situações complexas, inspirando confiança e direcionamento em equipes',
        'Tomada de decisão rápida e eficiente, conseguindo avaliar cenários rapidamente e implementar soluções práticas sem hesitação',
        'Orientação para resultados excepcionalmente forte, mantendo foco constante em objetivos e metas organizacionais',
        'Iniciativa proativa para identificar oportunidades e implementar mudanças necessárias antes que problemas se desenvolvam',
        'Competitividade saudável que impulsiona a excelência pessoal e organizacional, motivando outros a alcançar seu melhor desempenho',
        'Capacidade de trabalhar sob pressão mantendo alta performance e qualidade nas entregas mesmo em situações desafiadoras'
      ],
      'I': [
        'Comunicação eficaz e envolvente, capaz de transmitir ideias complexas de forma clara e motivadora para diferentes audiências',
        'Motivação de equipes através de entusiasmo genuíno e capacidade de criar um ambiente de trabalho positivo e energizante',
        'Networking excepcional, construindo e mantendo relacionamentos profissionais valiosos que beneficiam toda a organização',
        'Criatividade e inovação na resolução de problemas, trazendo perspectivas únicas e soluções originais para desafios complexos',
        'Otimismo contagiante que eleva o moral da equipe e mantém a motivação alta mesmo durante períodos difíceis',
        'Flexibilidade e adaptabilidade para se ajustar rapidamente a mudanças e novas circunstâncias organizacionais'
      ],
      'S': [
        'Trabalho em equipe exemplar, demonstrando capacidade excepcional de colaborar e apoiar colegas para alcançar objetivos comuns',
        'Estabilidade emocional que proporciona consistência e confiabilidade em todas as situações profissionais',
        'Lealdade organizacional profunda, demonstrando compromisso de longo prazo com pessoas, projetos e valores da empresa',
        'Paciência e perseverança para trabalhar metodicamente em projetos de longo prazo sem perder qualidade ou motivação',
        'Resolução de conflitos diplomática, mediando diferenças e encontrando soluções que beneficiem todas as partes envolvidas',
        'Suporte emocional e prático oferecido aos colegas, criando um ambiente de trabalho mais harmonioso e produtivo'
      ],
      'C': [
        'Análise detalhada e sistemática de problemas complexos, identificando padrões e nuances que outros podem negligenciar',
        'Qualidade no trabalho consistentemente alta, mantendo padrões rigorosos e entregando resultados precisos e confiáveis',
        'Organização exemplar de processos, informações e recursos, criando sistemas eficientes que beneficiam toda a equipe',
        'Planejamento estratégico cuidadoso que antecipa desafios e prepara soluções detalhadas antes da implementação',
        'Precisão técnica excepcional em tarefas especializadas, garantindo que todos os aspectos sejam executados corretamente',
        'Pensamento crítico apurado para avaliar informações, identificar riscos e tomar decisões baseadas em dados sólidos'
      ]
    };
    return strengths[type] || strengths['D'];
  };

  const getDiscImprovements = (type) => {
    const improvements = {
      'D': [
        'Desenvolver paciência e tolerância, aprendendo a valorizar processos mais lentos que podem resultar em melhores resultados de longo prazo',
        'Melhorar escuta ativa e empática, dedicando mais tempo para compreender verdadeiramente as perspectivas e necessidades dos outros',
        'Considerar mais ativamente as opiniões da equipe antes de tomar decisões, incorporando diferentes pontos de vista no processo decisório',
        'Controlar impulsividade em situações de pressão, desenvolvendo estratégias para pausar e refletir antes de agir ou responder',
        'Aprimorar habilidades de delegação confiando mais nas capacidades dos membros da equipe e fornecendo orientação clara',
        'Desenvolver maior sensibilidade interpessoal para reconhecer e responder adequadamente às emoções e reações dos colegas'
      ],
      'I': [
        'Focar mais consistentemente nos detalhes importantes, desenvolvendo sistemas e técnicas para manter atenção em aspectos técnicos cruciais',
        'Melhorar organização pessoal e profissional, criando estruturas e rotinas que suportem maior eficiência e produtividade',
        'Cumprir prazos de forma mais consistente, desenvolvendo habilidades de gestão de tempo e priorizando tarefas adequadamente',
        'Ser mais analítico na tomada de decisões, incorporando dados objetivos e análise crítica além da intuição pessoal',
        'Desenvolver maior foco e concentração em tarefas individuais, reduzindo distrações e mantendo atenção sustentada',
        'Aprimorar habilidades de follow-up e acompanhamento, garantindo que compromissos e projetos sejam finalizados adequadamente'
      ],
      'S': [
        'Tomar mais iniciativa proativa, desenvolvendo confiança para propor ideias e liderar mudanças quando necessário',
        'Aceitar e adaptar-se mais facilmente a mudanças organizacionais, desenvolvendo resiliência e flexibilidade mental',
        'Expressar opiniões e sentimentos de forma mais direta e assertiva, compartilhando perspectivas valiosas com a equipe',
        'Ser mais assertivo em situações de conflito, defendendo posições importantes sem comprometer relacionamentos',
        'Desenvolver maior tolerância a ambiguidade e incerteza, conseguindo funcionar efetivamente em ambientes menos estruturados',
        'Aprimorar habilidades de negociação e persuasão para influenciar positivamente resultados e decisões organizacionais'
      ],
      'C': [
        'Ser mais flexível e adaptável a mudanças imprevistas, desenvolvendo tolerância a imperfeições e ajustes de último minuto',
        'Melhorar relacionamentos interpessoais através de maior abertura emocional e comunicação mais calorosa com colegas',
        'Aceitar riscos calculados quando benefícios potenciais justificam a incerteza, desenvolvendo maior tolerância a ambiguidade',
        'Comunicar-se de forma mais frequente e acessível, compartilhando conhecimentos e insights com linguagem mais simples',
        'Desenvolver maior velocidade na tomada de decisões, equilibrando análise detalhada com necessidades de timing organizacional',
        'Aprimorar habilidades de trabalho em equipe, colaborando mais ativamente e compartilhando responsabilidades com outros'
      ]
    };
    return improvements[type] || improvements['D'];
  };

  const getDiscCommunicationStyle = (type) => {
    const styles = {
      'D': [
        'Direto e objetivo na comunicação, preferindo ir direto ao ponto sem rodeios desnecessários ou conversas prolongadas',
        'Prefere comunicação rápida e eficiente, valorizando reuniões curtas e decisivas que resultem em ações concretas',
        'Usa linguagem assertiva e confiante, expressando opiniões de forma clara e sem ambiguidade sobre questões importantes',
        'Foca consistentemente nos resultados e impactos práticos, direcionando conversas para soluções e próximos passos',
        'Pode ser percebido como áspero ou impaciente quando a pressão aumenta, necessitando atenção ao tom e impacto emocional',
        'Utiliza comunicação hierárquica naturalmente, assumindo papel de liderança em discussões e direcionando agendas'
      ],
      'I': [
        'Entusiástico e expressivo na comunicação, trazendo energia positiva e dinamismo para todas as interações profissionais',
        'Gosta de conversas informais e pessoais, construindo rapport através de conexões humanas antes de abordar questões de negócios',
        'Usa gestos, expressões faciais e linguagem corporal de forma natural para enfatizar pontos e manter engajamento',
        'Conta histórias e exemplos pessoais para ilustrar conceitos, tornando informações complexas mais acessíveis e memoráveis',
        'Pode divagar do assunto principal em conversas, necessitando estrutura para manter foco em objetivos específicos',
        'Prefere comunicação verbal e presencial, funcionando melhor em ambientes interativos do que em comunicação escrita formal'
      ],
      'S': [
        'Calmo e respeitoso em todas as interações, mantendo tom diplomático mesmo em situações de tensão ou desacordo',
        'Prefere conversas one-on-one ou em grupos pequenos, sentindo-se mais confortável em ambientes íntimos e pessoais',
        'Escuta atentamente e demonstra interesse genuíno nas perspectivas dos outros, fazendo perguntas para compreender melhor',
        'Evita confrontos diretos e situações de conflito, buscando harmonia e consenso em todas as discussões',
        'Pode ter dificuldade em expressar desacordo abertamente, necessitando encorajamento para compartilhar opiniões divergentes',
        'Utiliza comunicação empática e de apoio, oferecendo suporte emocional e prático aos colegas quando necessário'
      ],
      'C': [
        'Preciso e detalhado na comunicação, fornecendo informações completas e exatas para evitar mal-entendidos',
        'Prefere comunicação por escrito para documentar decisões e garantir que todos os detalhes sejam preservados adequadamente',
        'Usa dados, fatos e evidências objetivas para fundamentar argumentos e recomendações de forma convincente',
        'Faz perguntas específicas e técnicas para obter clareza completa sobre processos, procedimentos e expectativas',
        'Pode ser percebido como crítico ou excessivamente analítico quando questiona detalhes ou identifica problemas potenciais',
        'Prefere tempo para processar informações antes de responder, funcionando melhor quando não pressionado para respostas imediatas'
      ]
    };
    return styles[type] || styles['D'];
  };

  const getDiscWorkEnvironment = (type) => {
    const environments = {
      'D': [
        'Ambiente dinâmico e desafiador que oferece oportunidades constantes de crescimento, competição saudável e projetos estimulantes',
        'Autonomia completa para tomar decisões importantes sem necessidade de aprovação constante ou microgerenciamento supervisório',
        'Metas claras e desafiadoras que proporcionem senso de propósito e direção, com deadlines realistas mas ambiciosos',
        'Pouca supervisão direta permitindo liberdade para experimentar abordagens inovadoras e assumir riscos calculados',
        'Foco consistente em resultados mensuráveis onde performance e conquistas sejam reconhecidas e recompensadas adequadamente',
        'Cultura organizacional que valorize liderança, iniciativa individual e capacidade de implementar mudanças rapidamente'
      ],
      'I': [
        'Ambiente social e colaborativo que facilite interações frequentes, trabalho em equipe e construção de relacionamentos profissionais',
        'Oportunidades regulares de interação com diferentes pessoas, departamentos e níveis hierárquicos dentro da organização',
        'Variedade constante nas tarefas e responsabilidades, evitando rotinas monótonas e proporcionando estímulos intelectuais diversos',
        'Reconhecimento público e celebração de conquistas individuais e coletivas através de diferentes canais de comunicação',
        'Flexibilidade de horários e localização que permita equilíbrio entre vida pessoal e profissional sem comprometer produtividade',
        'Cultura organizacional aberta que valorize criatividade, inovação e contribuições únicas de cada membro da equipe'
      ],
      'S': [
        'Ambiente estável e harmonioso que proporcione segurança psicológica, previsibilidade e relacionamentos de confiança duradouros',
        'Relacionamentos profissionais baseados em confiança mútua, respeito e colaboração genuína entre todos os níveis hierárquicos',
        'Processos bem definidos e documentados que proporcionem clareza sobre expectativas, responsabilidades e procedimentos organizacionais',
        'Tempo adequado para se adaptar a mudanças organizacionais, com suporte e orientação durante períodos de transição',
        'Trabalho em equipe valorizado e incentivado, com oportunidades de contribuir para objetivos coletivos e apoiar colegas',
        'Cultura organizacional que priorize bem-estar dos funcionários, desenvolvimento pessoal e manutenção de tradições positivas'
      ],
      'C': [
        'Ambiente organizado e estruturado com sistemas claros, processos documentados e hierarquias bem estabelecidas',
        'Acesso completo a informações, dados e recursos necessários para tomar decisões informadas e realizar trabalho de qualidade',
        'Padrões de qualidade claramente definidos e comunicados, com critérios objetivos para avaliação de performance e resultados',
        'Tempo suficiente para análise detalhada, pesquisa e planejamento antes da implementação de projetos ou tomada de decisões',
        'Procedimentos bem estabelecidos e testados que garantam consistência, precisão e conformidade com regulamentações aplicáveis',
        'Cultura organizacional que valorize expertise técnica, atenção aos detalhes e melhoria contínua de processos e sistemas'
      ]
    };
    return environments[type] || environments['D'];
  };

  const getDiscLeadershipStyle = (type) => {
    const styles = {
      'D': [
        'Líder autoritário e decisivo que assume naturalmente o comando de situações complexas, definindo direções claras para a equipe',
        'Toma decisões rapidamente com base em análise objetiva, implementando soluções eficazes mesmo sob pressão significativa',
        'Delega responsabilidades estrategicamente, confiando nas capacidades da equipe enquanto mantém controle sobre resultados finais',
        'Foca consistentemente em resultados mensuráveis, estabelecendo metas ambiciosas e cobrando performance de alta qualidade',
        'Pode ser percebido como controlador quando microgerencia, necessitando equilibrar direção com autonomia da equipe',
        'Demonstra coragem para tomar decisões impopulares quando necessário para o bem da organização ou projeto'
      ],
      'I': [
        'Líder inspirador e motivador que energiza equipes através de entusiasmo genuíno e visão positiva do futuro',
        'Encoraja participação ativa da equipe em brainstorming, decisões e implementação de projetos importantes',
        'Reconhece publicamente conquistas individuais e coletivas, celebrando sucessos e marcos alcançados pela equipe',
        'Promove ambiente de trabalho positivo e colaborativo onde criatividade e inovação são valorizadas e incentivadas',
        'Pode negligenciar detalhes operacionais importantes, necessitando suporte para garantir execução precisa de planos',
        'Utiliza storytelling e comunicação envolvente para transmitir visões e motivar equipes em direção aos objetivos'
      ],
      'S': [
        'Líder colaborativo e paciente que constrói consenso através de escuta ativa e inclusão de diferentes perspectivas',
        'Constrói relacionamentos de confiança duradouros com membros da equipe, criando ambiente psicologicamente seguro',
        'Oferece suporte contínuo à equipe tanto em aspectos profissionais quanto pessoais, demonstrando cuidado genuíno',
        'Mantém estabilidade organizacional durante períodos de mudança, proporcionando segurança e continuidade',
        'Pode evitar decisões difíceis que causem conflito, necessitando desenvolver assertividade em situações desafiadoras',
        'Facilita desenvolvimento individual dos membros da equipe através de mentoring e coaching personalizado'
      ],
      'C': [
        'Líder analítico e sistemático que baseia todas as decisões em dados objetivos, pesquisa detalhada e análise rigorosa',
        'Baseia decisões estratégicas em evidências sólidas, minimizando riscos através de planejamento meticuloso e preparação',
        'Estabelece padrões de qualidade excepcionalmente altos, garantindo excelência em todos os aspectos do trabalho da equipe',
        'Planeja cuidadosamente cada etapa de projetos complexos, antecipando desafios e preparando soluções detalhadas',
        'Pode ser percebido como indeciso quando demora para tomar decisões, necessitando equilibrar análise com timing',
        'Desenvolve expertise técnica da equipe através de treinamento estruturado e sharing de conhecimento especializado'
      ]
    };
    return styles[type] || styles['D'];
  };

  const getDiscDecisionMaking = (type) => {
    const processes = {
      'D': [
        'Toma decisões rapidamente utilizando experiência anterior e análise objetiva de situações complexas',
        'Baseia-se na combinação de intuição desenvolvida, experiência prática e avaliação rápida de riscos e benefícios',
        'Assume riscos calculados quando potencial de retorno justifica incertezas, demonstrando coragem empresarial',
        'Foca consistentemente no resultado final desejado, priorizando eficácia sobre consenso ou harmonia interpessoal',
        'Pode tomar decisões impulsivas sob pressão, necessitando pausar para considerar implicações de longo prazo',
        'Prefere tomar decisões autonomamente sem necessidade de aprovação ou validação externa constante'
      ],
      'I': [
        'Consulta amplamente outras pessoas para obter diferentes perspectivas e garantir buy-in organizacional',
        'Considera cuidadosamente o impacto das decisões nas relações interpessoais e dinâmica da equipe',
        'Busca consistentemente opções criativas e inovadoras que outros podem não ter considerado inicialmente',
        'Pode adiar decisões difíceis que envolvam conflito ou consequências negativas para pessoas queridas',
        'Influenciado por sentimentos e considerações emocionais além de fatores puramente racionais ou financeiros',
        'Prefere decisões que beneficiem o maior número de pessoas e mantenham harmonia organizacional'
      ],
      'S': [
        'Procura ativamente consenso da equipe antes de implementar mudanças significativas ou decisões importantes',
        'Avalia cuidadosamente o impacto de decisões na estabilidade organizacional e bem-estar dos colegas',
        'Prefere mudanças graduais e incrementais em vez de transformações bruscas ou revolucionárias',
        'Evita riscos desnecessários, priorizando segurança e previsibilidade sobre ganhos potenciais incertos',
        'Pode ser lento para decidir quando precisa de tempo para consultar stakeholders e avaliar todas as implicações',
        'Busca soluções que preservem relacionamentos existentes e mantenham tradições organizacionais valiosas'
      ],
      'C': [
        'Analisa dados meticulosamente, examinando tendências, padrões e evidências objetivas antes de proceder',
        'Considera sistematicamente todas as variáveis relevantes, incluindo fatores técnicos, financeiros e operacionais',
        'Busca consistentemente a opção mais correta e tecnicamente sólida, mesmo que seja mais complexa de implementar',
        'Evita decisões precipitadas, preferindo ter informações completas antes de comprometer recursos organizacionais',
        'Pode sofrer paralisia por análise quando busca perfection instead of progress em situações time-sensitive',
        'Documenta cuidadosamente o processo decisório para justificar escolhas e facilitar aprendizado futuro'
      ]
    };
    return processes[type] || processes['D'];
  };

  const getDiscStressTriggers = (type) => {
    const triggers = {
      'D': [
        'Perda de controle sobre situações importantes ou microgerenciamento que limite sua autonomia decisória',
        'Processos burocráticos lentos que atrasem implementação de soluções ou alcançar objetivos importantes',
        'Microgerenciamento excessivo que questione constantemente suas decisões ou limite sua liberdade de ação',
        'Indecisão crônica dos outros que resulte em atrasos, oportunidades perdidas ou paralisia organizacional',
        'Burocracia excessiva e procedimentos desnecessários que impedem progressão eficiente em direção aos resultados',
        'Ambientes onde iniciativa e liderança são desencorajadas ou onde não há clareza sobre expectativas de performance'
      ],
      'I': [
        'Trabalho isolado prolongado sem oportunidades de interação social ou colaboração com colegas',
        'Tarefas repetitivas e monótonas que não oferecem variedade, criatividade ou estímulos intelectuais',
        'Críticas públicas severas que afetem sua reputação ou relacionamentos profissionais importantes',
        'Falta de reconhecimento ou apreciação por contribuições, esforços e conquistas realizadas',
        'Ambiente excessivamente formal que limite expressão pessoal, criatividade ou interações autênticas',
        'Iso lamento social no trabalho onde construção de relacionamentos não é valorizada ou incentivada'
      ],
      'S': [
        'Mudanças organizacionais súbitas e não comunicadas que afetem estabilidade e previsibilidade do trabalho',
        'Conflitos interpessoais intensos ou ambientes de trabalho hostis que comprometam harmonia da equipe',
        'Pressão de tempo extrema com deadlines irrealistas que não permitam trabalho de qualidade',
        'Instabilidade organizacional crônica incluindo layoffs, reorganizações frequentes ou incerteza sobre o futuro',
        'Competição interna agressiva que promova rivalidade em vez de colaboração entre membros da equipe',
        'Ambientes onde lealdade e comprometimento de longo prazo não são valorizados ou recompensados adequadamente'
      ],
      'C': [
        'Padrões de qualidade consistentemente baixos que comprometam excelência e integridade do trabalho realizado',
        'Falta de acesso a informações completas e precisas necessárias para tomar decisões informadas',
        'Pressão para tomar decisões precipitadas sem tempo adequado para análise e consideração de todas as variáveis',
        'Críticas públicas ao trabalho técnico, especialmente quando baseadas em mal-entendidos ou informações incorretas',
        'Ambiente de trabalho cronicamente desorganizado onde sistemas e processos são inconsistentes ou mal definidos',
        'Expectativas ambíguas ou em constante mudança que tornem difícil atingir padrões de qualidade estabelecidos'
      ]
    };
    return triggers[type] || triggers['D'];
  };

  const getDiscCareerRecommendations = (type) => {
    const recommendations = {
      'D': [
        'Cargos de liderança executiva e gestão estratégica onde possa dirigir equipes e tomar decisões importantes autonomamente',
        'Empreendedorismo e desenvolvimento de negócios, incluindo startups, consultorias independentes e ventures inovadores',
        'Vendas estratégicas e negociações complexas, especialmente em mercados competitivos e situações high-stakes',
        'Consultoria organizacional e transformacional focada em resultados, reestruturações e otimização de performance',
        'Direção executiva e C-level positions onde liderança visonária e tomada de decisão rápida são essenciais',
        'Gestão de projetos complexos e turn-around situations que exijam liderança forte e orientação para resultados'
      ],
      'I': [
        'Marketing, branding e comunicação corporativa onde criatividade e habilidades interpessoais sejam centrais',
        'Vendas relationship-based e desenvolvimento de contas onde networking e persuasão sejam fundamentais',
        'Recursos humanos focado em engajamento, cultura organizacional e desenvolvimento de talentos',
        'Treinamento corporativo, coaching executivo e desenvolvimento organizacional que utilize habilidades comunicacionais',
        'Relações públicas, affairs públicos e comunicação externa que requeiram carisma e influência',
        'Roles em inovação, design thinking e creative problem-solving onde energia e otimismo sejam assets valiosos'
      ],
      'S': [
        'Atendimento ao cliente e customer success roles que valorizem paciencia, empatia e construção de relacionamentos',
        'Recursos humanos focado em employee relations, mediação e bem-estar organizacional',
        'Educação, treinamento e mentoring onde estabilidade, paciencia e apoio individual sejam importantes',
        'Serviços sociais, healthcare support e roles de cuidado que requeiram sensibilidade e comprometimento',
        'Suporte técnico e customer support onde consistência, confiabilidade e atendimento personalizado sejam cruciais',
        'Project coordination e program management que requeiram colaboração, estabilidade e atenção aos stakeholders'
      ],
      'C': [
        'Análise de dados, business intelligence e pesquisa quantitativa que requeiram precisão e atenção aos detalhes',
        'Pesquisa e desenvolvimento técnico, especialmente em áreas que exijam rigor científico e metodológico',
        'Contabilidade, auditoria e serviços financeiros onde precisão e conformidade regulatória sejam essenciais',
        'Engenharia e desenvolvimento técnico que requeiram planejamento detalhado e execução precisa',
        'Controle de qualidade, compliance e risk management onde padrões rigorosos e atenção aos detalhes sejam críticos',
        'Análise de processos, operations research e continuous improvement que utilizem habilidades analíticas sistematicas'
      ]
    };
    return recommendations[type] || recommendations['D'];
  };

  // Função para baixar PDF usando jsPDF puro (sem html2canvas)
  const handleDownloadPDF = () => {
    let loadingToast = null;

    try {
      // Validações
      if (!disc) {
        alert('Relatório não encontrado. Por favor, selecione um teste primeiro.');
        return;
      }

      // Mostrar loading
      loadingToast = document.createElement('div');
      loadingToast.innerHTML = '⏳ Gerando PDF...';
      loadingToast.className = 'fixed top-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      document.body.appendChild(loadingToast);

      console.log('📄 Iniciando geração de PDF com jsPDF puro...');

      // Criar PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Cores
      const primaryColor = [79, 70, 229]; // Indigo
      const secondaryColor = [100, 100, 100]; // Gray
      const accentColor = [34, 197, 94]; // Green

      // Helper para adicionar nova página se necessário
      const checkPageBreak = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // ====== CABEÇALHO ======
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 40, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RELATÓRIO DISC', pageWidth / 2, 20, { align: 'center' });

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Análise de Perfil Comportamental', pageWidth / 2, 30, { align: 'center' });

      yPosition = 50;

      // ====== INFORMAÇÕES DO USUÁRIO ======
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Informações do Candidato', margin, yPosition);
      yPosition += 8;

      autoTable(pdf, {
        startY: yPosition,
        head: [['Campo', 'Informação']],
        body: [
          ['Nome', user?.name || 'Não informado'],
          ['Email', user?.email || 'Não informado'],
          ['Data do Relatório', new Date().toLocaleDateString('pt-BR')],
          ['Perfil DISC', `${disc.type} - ${disc.name}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 }
      });

      yPosition = pdf.lastAutoTable.finalY + 15;
      checkPageBreak(30);

      // ====== PERFIL DISC ======
      pdf.setFillColor(...accentColor);
      pdf.rect(margin, yPosition, contentWidth, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`PERFIL ${disc.type} - ${disc.name.toUpperCase()}`, margin + 5, yPosition + 7);
      yPosition += 15;

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const descLines = pdf.splitTextToSize(disc.description, contentWidth);
      pdf.text(descLines, margin, yPosition);
      yPosition += descLines.length * 5 + 10;

      // ====== PONTUAÇÕES DISC ======
      checkPageBreak(50);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Pontuações DISC', margin, yPosition);
      yPosition += 8;

      const counts = disc.counts || { D: 0, I: 0, S: 0, C: 0 };
      autoTable(pdf, {
        startY: yPosition,
        head: [['Dimensão', 'Pontuação', 'Descrição']],
        body: [
          ['D - Dominância', counts.D.toString(), 'Orientação para resultados e controle'],
          ['I - Influência', counts.I.toString(), 'Sociabilidade e persuasão'],
          ['S - Estabilidade', counts.S.toString(), 'Paciência e colaboração'],
          ['C - Conformidade', counts.C.toString(), 'Precisão e análise']
        ],
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        margin: { left: margin, right: margin },
        styles: { fontSize: 10 }
      });

      yPosition = pdf.lastAutoTable.finalY + 15;

      // ====== CARACTERÍSTICAS GERAIS ======
      checkPageBreak(30);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CARACTERÍSTICAS GERAIS', margin + 3, yPosition + 5.5);
      yPosition += 13;

      if (disc.characteristics && disc.characteristics.length > 0) {
        disc.characteristics.forEach((char, index) => {
          checkPageBreak(15);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const charLines = pdf.splitTextToSize(`• ${char}`, contentWidth - 5);
          pdf.text(charLines, margin + 3, yPosition);
          yPosition += charLines.length * 4.5 + 2;
        });
      }
      yPosition += 8;

      // ====== PONTOS FORTES ======
      checkPageBreak(30);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PONTOS FORTES', margin + 3, yPosition + 5.5);
      yPosition += 13;

      if (disc.strengths && disc.strengths.length > 0) {
        disc.strengths.slice(0, 6).forEach((strength) => {
          checkPageBreak(15);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const strengthLines = pdf.splitTextToSize(`• ${strength}`, contentWidth - 5);
          pdf.text(strengthLines, margin + 3, yPosition);
          yPosition += strengthLines.length * 4.5 + 2;
        });
      }
      yPosition += 8;

      // ====== ÁREAS DE DESENVOLVIMENTO ======
      checkPageBreak(30);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ÁREAS DE DESENVOLVIMENTO', margin + 3, yPosition + 5.5);
      yPosition += 13;

      if (disc.improvements && disc.improvements.length > 0) {
        disc.improvements.slice(0, 6).forEach((improvement) => {
          checkPageBreak(15);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const improvementLines = pdf.splitTextToSize(`• ${improvement}`, contentWidth - 5);
          pdf.text(improvementLines, margin + 3, yPosition);
          yPosition += improvementLines.length * 4.5 + 2;
        });
      }
      yPosition += 8;

      // ====== ESTILO DE COMUNICAÇÃO ======
      checkPageBreak(30);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ESTILO DE COMUNICAÇÃO', margin + 3, yPosition + 5.5);
      yPosition += 13;

      if (disc.communicationStyle && disc.communicationStyle.length > 0) {
        disc.communicationStyle.slice(0, 6).forEach((style) => {
          checkPageBreak(15);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const styleLines = pdf.splitTextToSize(`• ${style}`, contentWidth - 5);
          pdf.text(styleLines, margin + 3, yPosition);
          yPosition += styleLines.length * 4.5 + 2;
        });
      }
      yPosition += 8;

      // ====== AMBIENTE DE TRABALHO IDEAL ======
      checkPageBreak(30);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AMBIENTE DE TRABALHO IDEAL', margin + 3, yPosition + 5.5);
      yPosition += 13;

      if (disc.workEnvironment && disc.workEnvironment.length > 0) {
        disc.workEnvironment.slice(0, 6).forEach((env) => {
          checkPageBreak(15);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const envLines = pdf.splitTextToSize(`• ${env}`, contentWidth - 5);
          pdf.text(envLines, margin + 3, yPosition);
          yPosition += envLines.length * 4.5 + 2;
        });
      }
      yPosition += 8;

      // ====== INTELIGÊNCIA EMOCIONAL ======
      if (inteligenciaEmocional && inteligenciaEmocional.scores) {
        checkPageBreak(50);
        pdf.setFillColor(...accentColor);
        pdf.rect(margin, yPosition, contentWidth, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('INTELIGÊNCIA EMOCIONAL', margin + 5, yPosition + 7);
        yPosition += 15;

        autoTable(pdf, {
          startY: yPosition,
          head: [['Dimensão', 'Pontuação']],
          body: [
            ['Automotivação', `${inteligenciaEmocional.scores.automotivacao}%`],
            ['Autoconsciência', `${inteligenciaEmocional.scores.autoconsciencia}%`],
            ['Habilidade Social', `${inteligenciaEmocional.scores.habilidadeSocial}%`],
            ['Empatia', `${inteligenciaEmocional.scores.empatia}%`],
            ['Autorregulação', `${inteligenciaEmocional.scores.autorregulacao}%`],
            ['Média Geral', `${inteligenciaEmocional.media_geral}%`]
          ],
          theme: 'striped',
          headStyles: { fillColor: primaryColor, textColor: 255 },
          margin: { left: margin, right: margin },
          styles: { fontSize: 10 }
        });

        yPosition = pdf.lastAutoTable.finalY + 10;
      }

      // ====== RECOMENDAÇÕES DE CARREIRA ======
      checkPageBreak(30);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RECOMENDAÇÕES DE CARREIRA', margin + 3, yPosition + 5.5);
      yPosition += 13;

      if (disc.careerRecommendations && disc.careerRecommendations.length > 0) {
        disc.careerRecommendations.slice(0, 6).forEach((career) => {
          checkPageBreak(15);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const careerLines = pdf.splitTextToSize(`• ${career}`, contentWidth - 5);
          pdf.text(careerLines, margin + 3, yPosition);
          yPosition += careerLines.length * 4.5 + 2;
        });
      }

      // ====== RODAPÉ ======
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `AgroSkills - Relatório DISC | Página ${i} de ${totalPages} | Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Salvar PDF
      const fileName = `relatorio-disc-${user?.name?.replace(/\s+/g, '-') || 'usuario'}-${Date.now()}.pdf`;
      pdf.save(fileName);

      // Remover loading
      if (loadingToast && document.body.contains(loadingToast)) {
        document.body.removeChild(loadingToast);
      }

      // Mostrar sucesso
      const successToast = document.createElement('div');
      successToast.innerHTML = '✅ PDF baixado com sucesso!';
      successToast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      document.body.appendChild(successToast);
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);

      console.log('✅ PDF gerado com sucesso usando jsPDF puro');

    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);

      if (loadingToast && document.body.contains(loadingToast)) {
        document.body.removeChild(loadingToast);
      }

      const errorToast = document.createElement('div');
      errorToast.innerHTML = `❌ Erro ao gerar PDF: ${error.message || 'Erro desconhecido'}`;
      errorToast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md text-sm';
      errorToast.style.zIndex = '9999';
      document.body.appendChild(errorToast);
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 5000);
    }
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

  // Calcular IE baseado no perfil DISC
  const calculateIEFromDISC = (discType, counts) => {
    // Pesos para cada perfil DISC em cada dimensão da IE
    const ieWeights = {
      'D': { automotivacao: 0.9, autoconsciencia: 0.6, habilidadeSocial: 0.5, empatia: 0.4, autorregulacao: 0.5 },
      'I': { automotivacao: 0.8, autoconsciencia: 0.5, habilidadeSocial: 0.9, empatia: 0.8, autorregulacao: 0.4 },
      'S': { automotivacao: 0.6, autoconsciencia: 0.7, habilidadeSocial: 0.7, empatia: 0.9, autorregulacao: 0.8 },
      'C': { automotivacao: 0.7, autoconsciencia: 0.9, habilidadeSocial: 0.5, empatia: 0.6, autorregulacao: 0.9 }
    };

    // Normalizar counts
    const total = (counts.D || 0) + (counts.I || 0) + (counts.S || 0) + (counts.C || 0);
    const normalized = {
      D: total > 0 ? (counts.D || 0) / total : 0.25,
      I: total > 0 ? (counts.I || 0) / total : 0.25,
      S: total > 0 ? (counts.S || 0) / total : 0.25,
      C: total > 0 ? (counts.C || 0) / total : 0.25
    };

    // Calcular cada dimensão da IE baseado na mistura de perfis
    const scores = {
      automotivacao: Math.round(
        (normalized.D * ieWeights.D.automotivacao +
          normalized.I * ieWeights.I.automotivacao +
          normalized.S * ieWeights.S.automotivacao +
          normalized.C * ieWeights.C.automotivacao) * 100
      ),
      autoconsciencia: Math.round(
        (normalized.D * ieWeights.D.autoconsciencia +
          normalized.I * ieWeights.I.autoconsciencia +
          normalized.S * ieWeights.S.autoconsciencia +
          normalized.C * ieWeights.C.autoconsciencia) * 100
      ),
      habilidadeSocial: Math.round(
        (normalized.D * ieWeights.D.habilidadeSocial +
          normalized.I * ieWeights.I.habilidadeSocial +
          normalized.S * ieWeights.S.habilidadeSocial +
          normalized.C * ieWeights.C.habilidadeSocial) * 100
      ),
      empatia: Math.round(
        (normalized.D * ieWeights.D.empatia +
          normalized.I * ieWeights.I.empatia +
          normalized.S * ieWeights.S.empatia +
          normalized.C * ieWeights.C.empatia) * 100
      ),
      autorregulacao: Math.round(
        (normalized.D * ieWeights.D.autorregulacao +
          normalized.I * ieWeights.I.autorregulacao +
          normalized.S * ieWeights.S.autorregulacao +
          normalized.C * ieWeights.C.autorregulacao) * 100
      )
    };

    const media_geral = Math.round(
      (scores.automotivacao + scores.autoconsciencia + scores.habilidadeSocial +
        scores.empatia + scores.autorregulacao) / 5
    );

    return { scores, media_geral };
  };

  // Método auxiliar para extrair dados de inteligência emocional
  const extractInteligenciaEmocional = (testData) => {
    console.log('🔍 Extraindo dados de inteligência emocional:', testData);

    // Buscar ie_scores conforme implementação do backend
    const ieScores = testData.ie_scores || testData.result?.ie_scores;

    if (ieScores && ieScores.scores) {
      console.log('✅ Encontrou dados de IE do backend:', ieScores);
      return {
        scores: {
          automotivacao: ieScores.scores.automotivacao || 0,
          autoconsciencia: ieScores.scores.autoconsciencia || 0,
          habilidadeSocial: ieScores.scores.habilidade_social || 0,
          empatia: ieScores.scores.empatia || 0,
          autorregulacao: ieScores.scores.autorregulacao || 0
        },
        media_geral: ieScores.media_geral || 0,
        calculado_em: ieScores.calculado_em
      };
    }

    // Se não encontrar dados do backend, calcular baseado no DISC
    console.log('⚠️ Não encontrou dados de IE do backend, calculando baseado no DISC');
    const counts = testData.disc_scores || testData.result?.disc?.counts || testData.counts || { D: 0, I: 0, S: 0, C: 0 };
    const perfil = testData.perfil || testData.profile || testData.result?.disc?.perfil;
    const discType = extractDiscType(perfil) || 'D';

    return calculateIEFromDISC(discType, counts);
  };

  // NOVA FUNCIONALIDADE: Carregar dados do teste selecionado
  useEffect(() => {
    const loadTestData = async () => {
      if (!selectedTestId || !user?.id) {
        setDiscProfile(null);
        setInteligenciaEmocional(null);
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
              improvements: getDiscImprovements(discType),
              communicationStyle: getDiscCommunicationStyle(discType),
              workEnvironment: getDiscWorkEnvironment(discType),
              leadershipStyle: getDiscLeadershipStyle(discType),
              decisionMaking: getDiscDecisionMaking(discType),
              stressTriggers: getDiscStressTriggers(discType),
              careerRecommendations: getDiscCareerRecommendations(discType),
              counts: testData.disc_scores || testData.result?.disc?.counts || testData.counts || { D: 0, I: 0, S: 0, C: 0 }
            };

            // Extrair dados de inteligência emocional
            const ieData = extractInteligenciaEmocional(testData);
            setInteligenciaEmocional(ieData);

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
            improvements: getDiscImprovements(discType),
            communicationStyle: getDiscCommunicationStyle(discType),
            workEnvironment: getDiscWorkEnvironment(discType),
            leadershipStyle: getDiscLeadershipStyle(discType),
            decisionMaking: getDiscDecisionMaking(discType),
            stressTriggers: getDiscStressTriggers(discType),
            careerRecommendations: getDiscCareerRecommendations(discType),
            counts: testData.disc_scores || testData.result?.disc?.counts || testData.counts || { D: 0, I: 0, S: 0, C: 0 }
          };

          // Extrair dados de inteligência emocional
          const ieData = extractInteligenciaEmocional(testData);
          setInteligenciaEmocional(ieData);

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

    function App() {
      const usuario = {
        name: "João Silva",
        email: "joao@email.com",
        cpf: "123.456.789-00",
        // ... outros dados
      };

      const discResult = {
        perfil: "D",
        counts: { D: 8, I: 5, S: 7, C: 3 }
      };

      const conteudos = [
        {
          title: "CARACTERÍSTICAS GERAIS",
          content: "<p>Você é uma pessoa dominante...</p>"
        }
      ];

      return (
        <RelatorioCompleto
          usuario={usuario}
          discResult={discResult}
          conteudos={conteudos}
          logoUrl="/sua-logo.svg"
        />
      );
    }


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
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Baixar PDF</span>
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

            <div className="card text-justify" id="relatorio-completo">
              <PremiumFeature
                feature={PREMIUM_FEATURES.DISC_RELATORIO}
                upgradeMessage="Faça upgrade para Premium e tenha acesso ao relatório completo do seu perfil DISC"
                mode="block"
              >
                <RelatorioCompleto
                  discResult={{
                    perfil: disc.type,
                    counts: disc.counts || { D: 0, I: 0, S: 0, C: 0 }
                  }}
                  inteligenciaEmocionalResult={inteligenciaEmocional}
                  liderancaResult={{
                    scores: {
                      modelador: 54,
                      democratico: 57,
                      afiliativo: 52,
                      treinador: 57,
                      visionario: 65,
                      autoritario: 29
                    }
                  }}
                  bigFiveResult={{
                    scores: {
                      extroversao: 42,
                      estabilidadeEmocional: 68,
                      abertura: 55,
                      socializacao: 59,
                      conscienciosidade: 48
                    }
                  }}
                  conteudos={[
                    {
                      title: "CARACTERÍSTICAS GERAIS",
                      content: `
                      <p>${disc.description}</p>
                      ${disc.characteristics ? `
                        <h3>Características Principais:</h3>
                        <ul>
                          ${disc.characteristics.map(char => `<li>${char}</li>`).join('')}
                        </ul>
                      ` : ''}
                    `
                    },
                    {
                      title: "PONTOS FORTES",
                      content: disc.strengths ? `
                      <ul>
                        ${disc.strengths.map(strength => `<li>${strength}</li>`).join('')}
                      </ul>
                    ` : '<p>Pontos fortes identificados através da análise DISC.</p>'
                    },
                    {
                      title: "ÁREAS DE DESENVOLVIMENTO",
                      content: disc.improvements ? `
                      <ul>
                        ${disc.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
                      </ul>
                    ` : '<p>Áreas de desenvolvimento identificadas através da análise DISC.</p>'
                    },
                    {
                      title: "ESTILO DE COMUNICAÇÃO",
                      content: disc.communicationStyle ? `
                      <ul>
                        ${disc.communicationStyle.map(style => `<li>${style}</li>`).join('')}
                      </ul>
                    ` : '<p>Estilo de comunicação baseado no perfil DISC.</p>'
                    },
                    {
                      title: "AMBIENTE DE TRABALHO IDEAL",
                      content: disc.workEnvironment ? `
                      <ul>
                        ${disc.workEnvironment.map(env => `<li>${env}</li>`).join('')}
                      </ul>
                    ` : '<p>Ambiente de trabalho preferido baseado no perfil DISC.</p>'
                    },
                    {
                      title: "ESTILO DE LIDERANÇA",
                      content: disc.leadershipStyle ? `
                      <ul>
                        ${disc.leadershipStyle.map(style => `<li>${style}</li>`).join('')}
                      </ul>
                    ` : '<p>Estilo de liderança baseado no perfil DISC.</p>'
                    },
                    {
                      title: "PROCESSO DE TOMADA DE DECISÃO",
                      content: disc.decisionMaking ? `
                      <ul>
                        ${disc.decisionMaking.map(process => `<li>${process}</li>`).join('')}
                      </ul>
                    ` : '<p>Processo de tomada de decisão baseado no perfil DISC.</p>'
                    },
                    {
                      title: "GATILHOS DE ESTRESSE",
                      content: disc.stressTriggers ? `
                      <h3>Principais fatores que podem causar estresse:</h3>
                      <ul>
                        ${disc.stressTriggers.map(trigger => `<li>${trigger}</li>`).join('')}
                      </ul>
                      <h3>Estratégias de gerenciamento:</h3>
                      <p>Reconhecer estes gatilhos é o primeiro passo para desenvolver estratégias eficazes de gerenciamento de estresse.</p>
                    ` : '<p>Gatilhos de estresse identificados através da análise DISC.</p>'
                    },
                    {
                      title: "RECOMENDAÇÕES DE CARREIRA",
                      content: disc.careerRecommendations ? `
                      <h3>Áreas de carreira recomendadas:</h3>
                      <ul>
                        ${disc.careerRecommendations.map(career => `<li>${career}</li>`).join('')}
                      </ul>
                      <p><strong>Nota:</strong> Essas são sugestões baseadas no seu perfil DISC. O sucesso profissional pode ser alcançado em diversas áreas com o desenvolvimento adequado das competências necessárias.</p>
                    ` : '<p>Recomendações de carreira baseadas no perfil DISC.</p>'
                    },
                  ]}
                />
              </PremiumFeature>
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