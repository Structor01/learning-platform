// RelatorioCompleto.jsx
import React from 'react';
import '../../styles/report.css'
import { InteligenciaEmocionalChart } from '../charts/InteligenciaEmocionalChart';
import { LiderancaChart } from '../charts/LiderancaChart';
import { BigFiveChart } from '../charts/BigFiveChart';

export const RelatorioCompleto = ({
  usuario,
  discResult,
  inteligenciaEmocionalResult,
  liderancaResult,
  bigFiveResult,
  conteudos,
  logoUrl = "/logo.svg"
}) => {

  // Garantir que discResult.counts existe e tem valores válidos
  const counts = discResult?.counts || { D: 0, I: 0, S: 0, C: 0 };

  // Usar dados de inteligência emocional calculados pelo backend
  const ieScores = inteligenciaEmocionalResult?.scores || {
    automotivacao: 0,
    autoconsciencia: 0,
    habilidadeSocial: 0,
    empatia: 0,
    autorregulacao: 0
  };

  // Usar media_geral calculada pelo backend
  const mediaGeralIE = inteligenciaEmocionalResult?.media_geral || 0;

  // Estrutura para facilitar uso nos componentes
  const porcentagensIE = {
    geral: mediaGeralIE,
    automotivacao: ieScores.automotivacao || 0,
    autoconsciencia: ieScores.autoconsciencia || 0,
    habilidadeSocial: ieScores.habilidadeSocial || 0,
    empatia: ieScores.empatia || 0,
    autorregulacao: ieScores.autorregulacao || 0
  };

  // Função para converter letra do perfil para nome completo
  const getPerfilNome = (letra) => {
    const nomes = {
      'D': 'Dominante',
      'I': 'Influente',
      'S': 'Estável',
      'C': 'Consciencioso'
    };
    return nomes[letra?.toUpperCase()] || letra;
  };

  // Função para calcular o perfil dominante baseado nos resultados
  const calcularPerfilDominante = () => {
    const valores = [
      { letra: 'D', valor: counts.D || 0 },
      { letra: 'I', valor: counts.I || 0 },
      { letra: 'S', valor: counts.S || 0 },
      { letra: 'C', valor: counts.C || 0 }
    ];

    // Encontrar o maior valor
    const perfilDominante = valores.reduce((max, atual) =>
      atual.valor > max.valor ? atual : max
    );

    return {
      letra: perfilDominante.letra,
      nome: getPerfilNome(perfilDominante.letra),
      valor: perfilDominante.valor
    };
  };

  const perfilCalculado = calcularPerfilDominante();

  const discData = [
    { name: 'Dominante', value: counts.D || 0, key: 'D' },
    { name: 'Influente', value: counts.I || 0, key: 'I' },
    { name: 'Estável', value: counts.S || 0, key: 'S' },
    { name: 'Conforme', value: counts.C || 0, key: 'C' }
  ];

  const total = discData.reduce((sum, item) => sum + item.value, 0);
  const percentuais = discData.map(item => ({
    ...item,
    percent: total > 0 ? (item.value / total) * 100 : 25
  }));

  const dataAtual = new Date().toLocaleDateString('pt-BR');

  return (
    <div className="">


      {/* Conteúdo */}
      <tbody>
        <tr>
          <td>
            <div>
              {/* Capa */}
              <div className="page">
                <section id="">
                  <div className="">

                  </div>
                  <div className="text-center">
                    <h1>Relatório AgroSkills</h1>
                    <i>Aceleradora de Carreiras</i>
                  </div>

                  {/* Gráficos DISC */}
                  <div className="w-full">
                    <p>Perfil: <b>{perfilCalculado.nome}</b> ({perfilCalculado.valor > 0 ? `${Math.round((perfilCalculado.valor / Object.values(counts).reduce((a, b) => a + b, 0)) * 100)}%` : '0%'})</p>
                    <div className="w-full mt-2">
                      <div className="flex rounded-lg overflow-hidden shadow-sm">
                        {percentuais.map((item, index) => {
                          const colors = ['bg-blue-500', 'bg-red-500', 'bg-yellow-400', 'bg-green-500'];
                          const percent = Math.round(item.percent || 0);
                          const width = Math.max(percent, 0); // Garantir que não seja negativo

                          // Se o percentual for 0, não mostrar a seção
                          if (width === 0) return null;

                          return (
                            <div
                              key={index}
                              className={`${colors[index]} text-white text-center py-6 px-2 font-extrabold text-sm flex items-center justify-center`}
                              style={{
                                width: `${width}%`,
                                minWidth: width < 15 ? '60px' : 'auto' // Largura mínima para textos pequenos
                              }}
                            >
                              {percent > 0 ? `${percent}%` : ''}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4 text-xs font-semibold">
                      {percentuais.map((item, index) => {
                        const colors = ['text-blue-600', 'text-red-600', 'text-yellow-600', 'text-green-600'];
                        const keys = ['D', 'I', 'S', 'C'];
                        const percent = Math.round(item.percent || 0);

                        return (
                          <div key={index} className={`${colors[index]} text-center`}>
                            <span className="block font-bold text-lg">{keys[index]}</span>
                            <span className="text-gray-500 text-xs">{item.name}</span>
                            <span className="block font-bold text-sm mt-1">{percent}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </div>

              {/* Contracapa */}
              <div className="page">
                <section id="contracapa">
                  <h1>O que você vai encontrar aqui?</h1>
                  <ol>
                    <li><a href="#autodiagnostico">AUTODIAGNÓSTICO DE CARREIRA</a></li>
                    <li><a href="#relatorio-agroskills">RELATÓRIO AGROSKILLS</a></li>
                    <li><a href="#metodologias">METODOLOGIA DISC | INTELIGÊNCIA EMOCIONAL | LIDERANÇA</a></li>
                    <li><a href="#disc">DISC</a></li>
                    <li><a href="#inteligencia-emocional">INTELIGÊNCIA EMOCIONAL</a></li>
                    <li><a href="#lideranca">ESTILO DE LIDERANÇA</a></li>
                    <li><a href="#big-5">BIG 5</a></li>
                    <li><a href="#plano-carreira">PLANO DE ACELERAÇÃO DE CARREIRA</a></li>
                  </ol>
                </section>
              </div>

              {/* Autodiagnóstico */}
              <div className="page">
                <section id="autodiagnostico">
                  <h1>1. Autodiagnóstico</h1>
                  <p>
                    Olá, este relatório analisou o seu perfil comportamental a sua maneira de agir e interagir com o ambiente. Apresentaremos tendências e padrões de personalidade comuns ao seu perfil. Ao final do relatório, utilize este espaço para refletir sobre seu momento atual e os aprendizados obtidos.
                  </p>
                </section>
              </div>


              <div className="page">
                <section id="relatorio-agroskills">
                  <h1>2. Relatório Agroskills</h1>
                  <p className="text-center pb-5">
                    <i>"Nosso objetivo é te ajudar a se transformar em uma grande potência no Agro e acelerar seu crescimento profissional."</i>
                  </p>
                  <p className='text-justify'>O Relatório Agroskils foi desenvolvido com objetivo de ajudar profissionais do Agronegócios a diagnosticar seus maiores talentos e  compreender a personalidade e as potenciais competências como indivíduos. Entender quais são os pontos fortes e as oportunidades de melhoria para, assim, promover tanto o desenvolvimento pessoal e profissional, como também para melhorar o nível de satisfação interna e externa. Acreditamos profundamente que a alta performance pessoal e profissional passam diretamente pela coragem e a humildade de olharmos para onde estamos, valorizar o que já temos e buscar incansavelmente desenvolver o que ainda precisamos.</p>
                  <p className='pt-2'> Em nossa tecnologia medimos 3 dimensões. São elas:</p>
                  <ol className='m-5'>
                    <li>1. Intensidade de Perfil Comportamental baseado na Teoria DISC de William M. Marston;</li>
                    <li>2. Inteligência emocional segundo Daniel Goleman ;</li>
                    <li>3. Estilo de Liderança;</li>
                    <li>4. Big 5.</li>
                  </ol>
                </section>
              </div>

              {/* METODOLOGIAS */}
              <div className="page">
                <section id="metodologias">
                  <h1>3. Metodologias</h1>
                  <div className='text-justify '>
                    <h2>DISC</h2>
                    <p className='pb-5 text-justify'>A ideia de que os seres humanos estão divididos em tipos, tem estado presente desde a antiguidade entre os pesquisadores do comportamento humano. Em 1928, o Advogado e Doutor em Psicologia de Harvard, William Moulton Marston desenvolveu e compilou informações de todos esses grandes estudiosos do comportamento humano, de todas as épocas, e aos 35 anos de idade em sua obra “ As emoções das pessoas normais ”, apresentou seu método de compreensão dos padrões de comportamento, temperamento e personalidade das pessoas, explicando as respostas emocionais das pessoas.</p>
                    <p>O Dr. Marston criou a base para a teoria conhecida e apreciada em todo o planeta intitulada como DISC; Apresentando uma visão abrangente da maneira como as pessoas pensam, agem e interagem. Segundo ele, todos nós apresentamos traços e padrões de comportamento que se relacionam com quatro estilos básicos de perfil que, por sua vez, explicam a origem do acrônimo DISC: Dominance (Dominância); Influence (Influência); Steadiness (Estabilidade) e Conscientious (Conformidade). Para ele o comportamento é definido como sendo o somatório dos diversos estilos de respostas de uma pessoa aos mais variados estímulos, todos nós temos em intensidades diferentes a presença destes 04 fatores em nossa personalidade.</p>
                  </div>
                  <div className='subsection'>
                    <h2>Inteligência Emocional</h2>
                    <p className='text-justify'>A metodologia utilizada foi desenvolvida pelo Daniel Goleman em 1995 e de acordo com o seu livro, o quociente emocional (QE) representa 80% das aptidões necessárias para que uma pessoa se torne bem-sucedida. Ou seja, administrar bem o que você sente é um dos fatores da inteligência emocional e faz toda a diferença na sua vida pessoal e profissional.</p>
                  </div>
                  <div className="subsection">
                    <h2>ESTILO DE LIDERANÇA</h2>
                    <p className='text-justify'>Tradicionalmente, a ideia de liderança é relacionada à habilidade de motivar, influenciar, inspirar e comandar equipes com a finalidade de obter resultados satisfatórios, a partir de um grupo de metas pré-definidas.</p>
                    <p>Para cada perfil, cada pessoa existe um estilo e características de lideranças  que serão mapeado por esse levantamento.</p>
                  </div>
                  <div className="subsection">
                    <h2>BIG 5</h2>
                    <p className='text-justify'>
                      O Big Five, que você também pode conhecer pelo nome de Modelo dos Cinco Grandes Fatores, é resultado do estudo da Teoria dos Traços de Personalidade. Ele descreve as dimensões humanas básicas e tem origem na análise da linguagem para entender a personalidade das pessoas. A partir dele é possível entender o modo como indivíduos sentem, pensam e reagem diante de situações diversas.<br />
                      <br />
                      <br />
                    </p>
                  </div>
                </section>
              </div>

              {/* DISC */}
              <div className="page">
                <section id="disc">
                  <h1>4. DISC</h1>

                  {/* Puxar perfil do usuário */}
                  <p>Perfil: <b>{perfilCalculado.nome}</b> ({perfilCalculado.valor > 0 ? `${Math.round((perfilCalculado.valor / Object.values(counts).reduce((a, b) => a + b, 0)) * 100)}%` : '0%'})</p>
                  <div className="bar-chart">
                    <div className="legend">
                      {percentuais.map((item, index) => (
                        <div key={index}>
                          <span></span>
                          <small>{item.name}</small>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gráficos */}
                  <div className="w-full">
                    <div className="flex rounded-lg overflow-hidden shadow-sm">
                      {percentuais.map((item, index) => {
                        const colors = ['bg-blue-500', 'bg-red-500', 'bg-yellow-400', 'bg-green-500'];
                        const percent = Math.round(item.percent || 0);
                        const width = Math.max(percent, 0);

                        // Se o percentual for 0, não mostrar a seção
                        if (width === 0) return null;

                        return (
                          <div
                            key={index}
                            className={`${colors[index]} text-white text-center py-6 px-4 font-medium text-base flex items-center justify-center`}
                            style={{
                              width: `${width}%`,
                              minWidth: width < 15 ? '60px' : 'auto'
                            }}
                          >
                            {percent > 0 ? `${percent}%` : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conteúdos do relatório */}
                  {conteudos.map((content, index) => (
                    <div key={index} className="text-justify">
                      <h2 className='pt-4'>{content.title}</h2>
                      <div dangerouslySetInnerHTML={{ __html: content.content }} />
                    </div>
                  ))}
                </section>
              </div>

              {/* Inteligência emocional */}
              <div className="page">
                <section id="inteligencia-emocional">
                  <h1>5. INTELIGÊNCIA EMOCIONAL</h1>
                  <p className='text-justify'>
                    Daniel Goleman descreve a inteligência emocional como a capacidade de uma pessoa de gerenciar seus sentimentos, de modo que eles sejam expressos de maneira apropriada e eficaz.
                    Segundo o psicólogo, o controle das emoções é essencial para o desenvolvimento da inteligência de um indivíduo.
                  </p>
                  <p className='text-justify'>Quando estamos em um ambiente profissional ou pessoal, estamos constantemente sendo influenciados pela nossa forma de pensar e emoções. A Inteligência emocional trata-se de utilizar a inteligência e a racionalidade para o controle das emoções.
                    Essa tem sido uma das principais soft skills demandadas no mercado de trabalho, temos visto no dia dia muitos profissionais com conhecimentos técnicos perdendo cargos de liderança e travados no crescimento de organizações devido a ausência da Inteligência emocional.</p>

                  <p className='text-justify pb-5'>
                    {/* user.name */}
                    Então vamos então ver o resultado do teste de Inteligência emocional?
                  </p>
                  <h2 class="before-chart">
                    SUA INTELIGÊNCIA EMOCIONAL É: <strong>{porcentagensIE.geral}%</strong>
                  </h2>
                  <div className="chart-wrapper">
                    <InteligenciaEmocionalChart porcentagensIE={porcentagensIE} />
                  </div>
                  <div className="subsection" data-index="0">
                    <h2>Automotivação — {porcentagensIE.automotivacao}%</h2>
                    <p
                      className='text-justify'>Automotivação é a capacidade que você tem de buscar em você mesmo motivos ou estímulos para alcançar seus objetivos. Na prática, isso se traduz em um perfil que não tende a precisar de direcionamentos ou cobranças, sendo altamente consciente de seus objetivos, tarefas e as executa de forma motivada.
                    </p>
                  </div>
                  <div className="subsection">
                    <h2>Autoconsciência — {porcentagensIE.autoconsciencia}%</h2>
                    <p className='text-justify'>
                      Dessa maneira, autoconsciência emocional é um termo para denominar a busca por um conhecimento maior de si mesmo e por estar ciente da existência das nossas emoções, com o objetivo de compreender o que sentimos e vivenciamos no dia a dia.
                    </p>
                  </div>
                  <div className="subsection">
                    <h2>Habilidade Social — {porcentagensIE.habilidadeSocial}%</h2>
                    <p className='text-justify'>
                      O que são habilidades socioemocionais? São habilidades que,  ajudam nas interações sociais por meio do controle das emoções. São competências essenciais para a vida em sociedade, que permitem que as pessoas tenham interações mais saudáveis, com menos atritos e conflitos.
                    </p>
                  </div>
                  <div className="subsection">
                    <h2>Empatia — {porcentagensIE.empatia}%</h2>
                    <p className='text-justify'>
                      A empatia emocional ou empatia afetiva é caracterizada por ser a capacidade de compartilhar dos mesmos sentimentos de outro indivíduo; isso ajuda a desenvolver melhor a conexão emocional com os outros

                    </p>
                  </div>
                  <div className="subsection">
                    <h2>Autorregulação — {porcentagensIE.autorregulacao}%</h2>
                    <p className='text-justify'>
                      Autorregulação emocional ou regulação emocional refere-se a um processo dinâmico intrinsecamente ligado a esforços conscientes no controle dos comportamentos, dos sentimentos e das emoções para que algum objetivo seja alcançado.
                    </p>
                  </div>
                </section>
              </div>

              {/* Estilo de liderança */}
              <div className="page">
                <section id="lideranca">
                  <h1>7. ESTILO DE LIDERANÇA</h1>
                  <div class="chart-wrapper">
                    <LiderancaChart liderancaData={liderancaResult?.scores} />
                  </div>
                  <br />
                  <br />
                  <div class="subsection">
                    <h2>Modelador — 54%</h2>
                    <p className='text-justify'>
                      Esse é um tipo de liderança, que precisa ter o controle total da situação. Foca em estabelecer elevados padrões de desempenho e lidera pelo exemplo, muito por conta da sua obsessão em alcançar resultados da melhor forma e de maneira rápida. Uma ressalva é que normalmente quem tem esse estilo de liderança pensa que todos no time devem ter ou tem o mesmo perfil, por isso ele exige isso de todos.
                    </p>
                  </div>
                  <div class="subsectio">
                    <h2>Democrático — 57%</h2>
                    <p className='text-justify'>
                      Podemos definir o que é liderança democrática como um modelo em que os colaboradores participam dos processos de tomada de decisão em conjunto com o líder. O poder decisório não se concentra naquele que ocupa posição de liderança, mas sim é distribuído.
                    </p>
                  </div>
                  <div class="subsection">
                    <h2>Afiliativo — 52%</h2>
                    <p className='text-justify'>
                      A Liderança Afiliativa faz parte do modelo proposto por Daniel Goleman e tem como característica principal valorizar as pessoas e suas necessidades. O que percebemos nesse perfil é uma atuação altamente empática, o que favorece a comunicação dentro da equipe, promove maior segurança psicológica e fomenta a confiança.
                    </p>
                  </div>
                  <div class="subsection">
                    <h2>Treinador — 57%</h2>
                    <p className='text-justify'>
                      O perfil Treinador sabe exatamente onde estão os pontos fortes e as oportunidades de melhoria de cada indivíduo da equipe e leva isso em consideração ao distribuir tarefas. Funciona bem quando o líder quer ajudar os membros de sua equipe a desenvolver seus pontos fortes para terem sucesso no longo prazo

                    </p>
                  </div>
                  <div class="subsection">
                    <h2>Visionário — 65%</h2>
                    <p className='text-justify'>
                      Liderança visionária é guiar a equipe de forma clara em direção a uma visão de futuro, de longo prazo, que cumpre objetivos estratégicos da empresa. O líder visionário de sucesso consegue alcançar grandes resultados financeiros por explorar estratégias inteligentes.
                    </p>
                  </div>
                  <div class="subsection">
                    <h2>Autoritário — 29%</h2>
                    <p className='text-justify'>
                      O líder Autoritário/ Coercitivo é uma pessoa que exige respostas rápidas do time e que &nbsp;tendem a decidir muito rápido e, por isso, pressionam a equipe para acompanhar seu ritmo. Esse estilo de liderança é muito eficaz em casos de crise, pois assim, o líder consegue direcionar o time rapidamente para solucionar desafios. Há lacunas de comunicação a serem trabalhadas, geralmente.
                    </p>
                  </div>
                </section>
              </div>
              {/* Big five */}
              <div className='page'>
                <section id='big-5'>
                  <h1>6. BIG FIVE</h1>
                  <p className="text-justify">
                    O Big Five, que você também pode conhecer pelo nome de Modelo dos Cinco Grandes Fatores, é resultado do estudo da Teoria dos Traços de Personalidade. Ele descreve as dimensões humanas básicas e tem origem na análise da linguagem para entender a personalidade das pessoas. A partir dele é possível entender o modo como indivíduos sentem, pensam e reagem diante de situações diversas.<br />
                    <br />
                    <br />
                  </p>
                  <div className="chart-wrapper">
                    <BigFiveChart bigFiveData={bigFiveResult?.scores} />
                  </div>
                  <div className="subsection">
                    <h2>Extroversão — 42%</h2>
                    <p className='text-justify pb-4'>
                      Extroversão (às vezes chamada de Extraversão) é uma característica que muitos terão se deparado em suas próprias vidas. É facilmente identificável e amplamente reconhecível como “alguém que fica energizado na companhia de outros”.&nbsp;
                    </p>
                    <p className='text-justify pb-4'>
                      Isto, entre outros traços incluem, a conversação, a assertividade e as elevadas quantidades de expressividade emocional, tornaram as pessoas extrovertidas amplamente reconhecíveis ao longo de muitos anos de interação social. Todos nós temos um amigo ou membro da família - ou vários - que não são introvertidos. Eles prosperam por serem o centro das atenções, gostam de conhecer novas pessoas e de alguma forma tendem a ter o maior grupo de amigos  que você já conheceu.&nbsp;
                    </p>
                    <p className='text-justify pb-4'>
                      O oposto é, claro, alguém em nossas vidas que podemos conhecer, um introvertido. Eles preferem a solidão e têm menos energia em situações sociais. Estar no centro das atenções ou fazer pequenas conversas pode ser bastante difícil. Os extrovertidos tendem a ter papéis mais públicos, incluindo áreas como vendas, marketing, ensino e cargos mais políticos. Vistos como líderes, as pessoas extrovertidas terão mais chances de liderar do que ficar na multidão.
                    </p>
                  </div>

                  <div class="subsection">
                    <h2>Estabilidade Emocional — 68%</h2>
                    <p className='text-justify pb-4'>
                      Instabilidade Emocional é caracterizado pela tristeza, mau humor e instabilidade emocional. Muitas vezes confundido com comportamento antissocial, ou pior, uma questão psicológica maior, o neuroticismo é uma resposta física e emocional ao estresse e às ameaças percebidas na vida diária de alguém.
                    </p>
                    <p className='text-justify pb-4'>
                      Indivíduos que exibem altos níveis de Instabilidade Emocional tendem a experimentar mudanças de humor, ansiedade e irritabilidade. Alguns indivíduos que experimentam mudanças repentinas de caráter a partir de uma perspectiva do dia-a-dia podem ser altamente neuróticos e responder a altos níveis de estresse em seu trabalho e vida pessoal.&nbsp;
                    </p>
                    <p className='text-justify pb-4'>
                      A ansiedade, que desempenha um grande papel na composição da Estabilidade Emocional, tem a ver com a capacidade de um indivíduo de lidar com o estresse e com o risco percebido ou real. As pessoas que sofrem com neuroticismo vão pensar demais em muitas situações e encontrarão dificuldade em relaxar mesmo em seu próprio espaço.
                    </p>
                    <p className='text-justify pb-4'>
                      Naturalmente, aqueles que se classificam mais altos no nível Estabilidade exibirão uma atitude mais estável e emocionalmente resiliente em relação ao estresse e às situações. Os que sofrem de alto nível de Estabilidade raramente se sentem tristes ou deprimidos, dedicando tempo para se concentrar no momento presente e não se envolver em aritmética mental sobre possíveis fatores indutores de estresse.
                    </p>
                  </div>
                  <div class="subsection">
                    <h2>Abertura a novas experiências — 55%</h2>
                    <p className='text-justify pb-4'>
                      A abertura é uma característica que inclui imaginação e visão. O mundo, outras pessoas e a ânsia de aprender e experimentar coisas novas é particularmente alto para este traço de personalidade. Isso leva a ter uma ampla gama de interesses e ser mais aventureiro quando se trata de tomada de decisão.&nbsp;A criatividade também desempenha um papel importante no traço de abertura; isso leva a uma maior zona de conforto quando se trata de pensamento abstrato e lateral.
                    </p>
                    <p className='text-justify pb-4'>
                      Pense naquela pessoa que está sempre pedindo a coisa mais exótica do cardápio, indo a lugares diferentes e tendo interesses que você nunca teria pensado - essa é uma pessoa que tem um alto traço de abertura. Qualquer pessoa com essa característica baixa tende a ser vista com abordagens mais tradicionais para a vida e pode ter dificuldades quando se trata de resolver problemas fora de sua zona de conforto de conhecimento.
                    </p>
                  </div>
                  <div class="subsection">
                    <h2>Socialização — 59%</h2>
                    <p className='text-justify pb-4'>
                      As pessoas que demonstram grande socialização mostrarão sinais de confiança, altruísmo, gentileza e afeto. Pessoas altamente agradáveis tendem a ter comportamentos pró-sociais elevados, o que significa que estão mais inclinadas a ajudar outras pessoas.&nbsp;
                    </p>
                    <p className='text-justify pb-4'>
                      Compartilhar, confortar e cooperar são características que se prestam a tipos de personalidade altamente agradáveis. A empatia com os outros é comumente entendida como outra forma de agradabilidade, mesmo que o termo não se encaixe.
                    </p>
                    <p className='text-justify pb-4'>
                      O oposto de socialização é desagradabilidade, mas se manifesta em traços de comportamento que são socialmente desagradáveis. Manipulação e grosseria para com os outros, falta de cuidado ou simpatia, falta de interesse pelos outros e seus problemas são bastante comuns.&nbsp;
                    </p>
                    <p className='text-justify pb-4'>
                      Pessoas sociáveis tendem a encontrar carreiras em áreas onde podem ajudar mais. Funcionários que atuam com caridade, com o próximo, com saúde mental e até mesmo aqueles que se voluntariam e dedicam tempo ao terceiro setor (estudos sociais) estão no topo da tabela de socialização.
                    </p>
                  </div>
                  <div class="subsection">
                    <h2>Conscienciosidade — 48%</h2>
                    <p className='text-justify pb-4'>
                      Conscienciosidade é uma característica que inclui altos níveis de reflexão, bom controle de impulsos e comportamentos direcionados a metas. Esta abordagem organizada e estruturada é frequentemente encontrada dentro de pessoas que trabalham na pesquisa e até mesmo na área de finanças, onde orientação detalhada e organização são necessárias como um conjunto de habilidades.&nbsp;&nbsp;
                    </p>
                    <p className='text-justify pb-4'>
                      Uma pessoa altamente conscienciosa planeja regularmente com antecedência e analisa seu próprio comportamento para ver como ele afeta os outros. Equipes de gerenciamento de projetos e departamentos de recursos humanos têm geralmente pessoas altamente conscienciosas trabalhando em suas equipes para ajudar a equilibrar as funções estruturais dentro do desenvolvimento geral.&nbsp;
                    </p>
                    <p className='text-justify pb-4'>
                      Um bom exemplo de uma pessoa conscienciosa seria alguém que você conhece que está sempre planejando com antecedência para a próxima vez que vocês se encontrarem - e enquanto isso, permanece regularmente em contato, verificando o seu bem-estar. Eles gostam de se organizar em torno de certas datas e eventos e estão focados em você quando se encontram.&nbsp;
                    </p>
                    <p className='text-justify pb-4'>
                      As pessoas com baixa conscienciosidade tendem a não gostar de estrutura e horários, procrastinam em tarefas importantes e não conseguem completar tarefas também.
                    </p>
                  </div>

                </section>

              </div>
            </div>




          </td>
        </tr>
      </tbody >
    </div >

  );
};