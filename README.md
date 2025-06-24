# EduPlatform - Plataforma de Ensino Personalizada

Uma plataforma de ensino moderna e personalizada inspirada nos princípios de design do Steve Jobs, com foco em experiência do usuário e estratégias de LTV (Lifetime Value).

## 🎯 Características Principais

### Design Minimalista
- Interface inspirada nos princípios de design do Steve Jobs
- "Simplicidade é a sofisticação suprema"
- Paleta de cores preto, prata e branco
- Tipografia limpa e legível

### Experiência Netflix para Educação
- Dashboard com carrosséis de conteúdo
- Recomendações personalizadas
- Seção "Continue assistindo"
- Player de vídeo com controles elegantes

### Personalização DISC
- Interface adaptada ao perfil comportamental do usuário
- Cores e elementos visuais personalizados por perfil:
  - **Dominante (D)**: Vermelho energético
  - **Influente (I)**: Verde vibrante
  - **Estável (S)**: Azul confiável
  - **Conforme (C)**: Laranja preciso

### Estratégias de LTV
- Cross-sell automático baseado no perfil
- Trilhas de aprendizado personalizadas
- Sistema de conquistas e certificações
- Análise de progresso detalhada

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Roteamento**: React Router DOM
- **Ícones**: Lucide React
- **Animações**: Framer Motion
- **Gráficos**: Recharts

## 📱 Funcionalidades

### Autenticação
- Login minimalista com email/senha
- Integração com Google e Apple
- Interface limpa e intuitiva

### Dashboard Principal
- Visão geral do progresso
- Recomendações personalizadas por perfil DISC
- Métricas de engajamento
- Próximos conteúdos sugeridos

### Player de Vídeo
- Interface estilo Netflix
- Controles elegantes e responsivos
- Recursos adicionais (PDFs, links, quizzes)
- Navegação entre conteúdos

### Perfil do Usuário
- Análise detalhada do perfil DISC
- Histórico de conquistas
- Progresso nas trilhas de aprendizado
- Estatísticas de uso

## 🎨 Benchmarks

A plataforma foi desenvolvida com base nas melhores práticas de:

### Hotmart
- Estratégias de monetização
- Experiência de compra
- Gestão de conteúdo

### G4 Educação
- Metodologias de ensino corporativo
- Análise de LTV
- Personalização por perfil

## 🏗️ Arquitetura

### Componentes Principais
- `LoginPage`: Tela de autenticação minimalista
- `Dashboard`: Interface principal estilo Netflix
- `VideoPlayer`: Player de vídeo com recursos avançados
- `UserProfile`: Perfil detalhado com análise DISC
- `Navbar`: Navegação principal com busca

### Estrutura de Dados
```javascript
user: {
  name: string,
  email: string,
  discProfile: {
    dominante: number,
    influente: number,
    estavel: number,
    conforme: number,
    predominant: string
  },
  progress: {
    coursesCompleted: number,
    certifications: number,
    totalHours: number,
    currentProgress: number
  }
}
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- pnpm (recomendado) ou npm

### Instalação
```bash
# Clone o repositório
git clone https://github.com/Structor01/learning-platform.git

# Entre no diretório
cd learning-platform

# Instale as dependências
pnpm install

# Execute o servidor de desenvolvimento
pnpm run dev
```

### Build para Produção
```bash
# Gere o build otimizado
pnpm run build

# Visualize o build localmente
pnpm run preview
```

## 📊 Métricas de UX

### Princípios Aplicados
- **Máximo 3 cliques** para qualquer funcionalidade
- **Tempo de carregamento** < 2 segundos
- **Design responsivo** para todos os dispositivos
- **Acessibilidade** WCAG 2.1 AA

### Personalização por Perfil
- **Dominante**: Interface direta, métricas em destaque
- **Influente**: Elementos sociais, gamificação
- **Estável**: Progressão clara, suporte visível
- **Conforme**: Detalhes técnicos, certificações

## 🎯 Estratégias de LTV

### Cross-sell Automático
- Recomendações baseadas no perfil DISC
- Trilhas complementares sugeridas
- Upsell para certificações premium

### Engajamento
- Sistema de conquistas
- Streaks de estudo
- Comunidade por perfil

### Retenção
- Conteúdo personalizado
- Mentoria especializada
- Feedback contínuo

## 🔮 Roadmap

### Fase 1 (Atual)
- ✅ Interface básica
- ✅ Componentes principais
- ✅ Design system

### Fase 2
- [ ] Backend com Flask
- [ ] Autenticação real
- [ ] Base de dados

### Fase 3
- [ ] Sistema de pagamentos
- [ ] Analytics avançados
- [ ] Mobile app

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Contribuição

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de submeter um PR.

---

**Desenvolvido com ❤️ seguindo os princípios de design do Steve Jobs**

