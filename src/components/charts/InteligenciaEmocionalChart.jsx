import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export const InteligenciaEmocionalChart = ({ porcentagensIE }) => {
  const data = {
    labels: ['Automotivação', 'Autoconsciência', 'Habilidade Social', 'Empatia', 'Autorregulação'],
    datasets: [
      {
        data: [
          porcentagensIE.automotivacao,
          porcentagensIE.autoconsciencia,
          porcentagensIE.habilidadeSocial,
          porcentagensIE.empatia,
          porcentagensIE.autorregulacao
        ],
        backgroundColor: [
          '#3B82F6', // Azul
          '#10B981', // Verde
          '#F59E0B', // Amarelo
          '#EF4444', // Vermelho
          '#8B5CF6'  // Roxo
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#DC2626',
          '#7C3AED'
        ],
        borderWidth: 2,
        cutout: '50%'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};