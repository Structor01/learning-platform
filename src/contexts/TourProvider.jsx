import { TourProvider } from '@reactour/tour'
import { TbXboxX } from "react-icons/tb";




const steps = [
    {
        selector: '.first-step',
        content: 'Bem-vindo à AgroSkills! 🚀 Este botão inicia um tour guiado pela plataforma. Vamos começar nossa jornada!',
    },
    {
        selector: 'nav',
        content: 'Esta é a barra de navegação principal! 🧭 Use-a para acessar trilhas de aprendizado, vagas, seu perfil e outras funcionalidades.',
    },
    {
        selector: 'a[href="/entrevista-simulada"]',
        content: 'Use o Simulador de Entrevistas! Pratique e simule como seria sua performance em entrevistas reais do agronegócio.',
    },
    {
        selector: 'button[class*="chat-bot-button"]',
        content: '👋 Esta é a Iza, sua assistente pessoal de carreira! Ela está aqui para te ajudar em toda sua jornada profissional no agronegócio.',
    },
    {
        selector: '.lg\\:w-96',
        content: 'Este é seu Perfil DISC! 📊 Aqui você pode ver seu tipo comportamental e fazer ou refazer o teste para conhecer melhor suas características profissionais.',
    },
    {
        selector: '.vagas-section',
        content: 'Estas são as vagas mais recentes! 💼 Explore oportunidades de trabalho na área do agronegócio que combinam com seu perfil.',
    },
    {
        selector: '.biblioteca-section',
        content: 'Essa é a nossa seção de aplicativos, que vão te ajudar no seu desenvolvimento profissional!'
    },
    {
        selector: '.trilhas-section',
        content: 'Acesse as Trilhas de Treinamento! Se prepare para processos seletivos com conteúdos específicos.'
    }
]

export function CustomTourProvider({ children }) {
    return (
        <TourProvider
            steps={steps}
            scrollSmooth={true}
            padding={{ mask: 10, popover: [10, 10] }}
            showCloseButton={true}
            components={{
                Close: ({ onClick }) => (
                    <button onClick={onClick} style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <TbXboxX
                            className='' size={14} />
                    </button>
                ),
            }}
            styles={{
                popover: (base) => ({
                    ...base,
                    '--reactour-accent': '#10b981',
                    borderRadius: '16px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                    padding: '20px 50px 20px 20px',
                    maxWidth: '380px',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: '#334155',
                }),
                maskArea: (base) => ({
                    ...base,
                    rx: 12,
                }),
                badge: (base) => ({
                    ...base,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    borderRadius: '8px',
                }),
                controls: (base) => ({
                    ...base,
                    marginTop: '16px',
                }),
                navigation: (base) => ({
                    ...base,
                    gap: '8px',
                }),
                button: (base, { disabled }) => ({
                    ...base,
                    background: disabled ? '#f1f5f9' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: disabled ? '#94a3b8' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    ':hover': disabled ? {} : {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        transform: 'translateY(-1px)',
                    },
                }),
                dot: (base, { current }) => ({
                    ...base,
                    background: current ? '#10b981' : '#e2e8f0',
                    width: current ? '12px' : '8px',
                    height: current ? '12px' : '8px',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                }),
                close: (base) => ({
                    ...base,
                    top: '10px',
                    right: '10px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    width: '24px',
                    height: '24px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ':hover': {
                        background: '#dc2626',
                    },

                }),
            }}
        >
            {children}
        </TourProvider >
    )
}