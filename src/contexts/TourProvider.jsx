import { TourProvider } from '@reactour/tour'
import { useAuth } from './AuthContext'
import { useState, useEffect } from 'react'

// Função para criar steps dinâmicos baseado no status do usuário
const createDynamicSteps = (userStatus) => {
    const allPossibleSteps = [
        {
            id: 'welcome',
            selector: '.first-step',
            content: 'Bem-vindo à AgroSkills! 🚀 Este botão inicia um tour guiado pela plataforma. Vamos começar nossa jornada!',
            condition: () => true, // Sempre mostrar boas-vindas
        },
        {
            id: 'disc-test',
            selector: '.lg\\:w-96',
            content: '⚠️ Você ainda não fez seu teste DISC! 📊 Este teste é muito importante - ele identifica seu perfil comportamental e te ajuda a encontrar vagas ideais. Clique em "Fazer Teste DISC" para começar!',
            condition: () => !userStatus.hasDiscProfile,
        },
        {
            id: 'disc-profile',
            selector: '.lg\\:w-96',
            content: 'Ótimo! Você já tem seu Perfil DISC! 📊 Aqui você pode ver seu tipo comportamental e refazer o teste se quiser.',
            condition: () => userStatus.hasDiscProfile,
        },
        {
            id: 'profile-incomplete',
            selector: 'nav',
            content: '👤 Recomendamos completar seu perfil! Vá em "Perfil" na navegação para adicionar mais informações e aumentar suas chances nas vagas.',
            condition: () => !userStatus.hasCompleteProfile,
        },
        {
            id: 'vagas',
            selector: '[class*="grid"][class*="gap-4"]',
            content: 'Estas são as vagas mais recentes! 💼 Explore oportunidades de trabalho na área do agronegócio que combinam com seu perfil.',
            condition: () => true, // Sempre mostrar vagas
        },
        {
            id: 'first-application',
            selector: '[class*="grid"][class*="gap-4"]',
            content: '🎯 Você ainda não se candidatou a nenhuma vaga! Que tal explorar essas oportunidades e fazer sua primeira candidatura?',
            condition: () => !userStatus.hasApplications,
        },
        {
            id: 'navigation',
            selector: 'nav',
            content: 'Esta é a barra de navegação principal! 🧭 Use-a para acessar trilhas de aprendizado, vagas, seu perfil e outras funcionalidades.',
            condition: () => true, // Sempre mostrar navegação
        },
    ];

    // Filtrar apenas os steps que devem ser mostrados
    return allPossibleSteps.filter(step => step.condition());
};

export function CustomTourProvider({ children }) {
    const { user } = useAuth()
    const [dynamicSteps, setDynamicSteps] = useState([])

    useEffect(() => {
        if (user) {
            // Determinar status do usuário baseado nos dados disponíveis
            const userStatus = {
                hasDiscProfile: !!(user.disc_profile || user.discProfile || user.userLegacy?.discProfile),
                hasCompleteProfile: !!(user.profile_image && user.bio && user.location),
                hasApplications: user.applications?.length > 0 || false,
            }

            console.log('🎯 Tour - Status do usuário:', userStatus)
            console.log('🎯 Tour - Dados do usuário:', user)

            const steps = createDynamicSteps(userStatus)
            setDynamicSteps(steps)
        }
    }, [user])

    return (
        <TourProvider
            steps={dynamicSteps}
            styles={{
                popover: (base) => ({
                    ...base,
                    '--reactour-accent': '#10b981',
                    borderRadius: '12px',
                }),
            }}
        >
            {children}
        </TourProvider>
    )
}