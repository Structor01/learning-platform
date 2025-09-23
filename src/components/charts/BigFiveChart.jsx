import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export const BigFiveChart = ({ bigFiveData }) => {
  // Dados padrão se não forem fornecidos
  const defaultData = {
    extroversao: 42,
    estabilidadeEmocional: 68,
    abertura: 55,
    socializacao: 59,
    conscienciosidade: 48
  };

  const scores = bigFiveData || defaultData;

  const data = {
    labels: [
      'Extroversão',
      'Estabilidade Emocional',
      'Abertura a Experiências',
      'Socialização',
      'Conscienciosidade'
    ],
    datasets: [
      {
        label: 'Seu Perfil',
        data: [
          scores.extroversao,
          scores.estabilidadeEmocional,
          scores.abertura,
          scores.socializacao,
          scores.conscienciosidade
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.r}%`;
          }
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          callback: function(value) {
            return value + '%';
          },
          font: {
            size: 10
          }
        },
        grid: {
          color: '#E5E7EB'
        },
        angleLines: {
          color: '#E5E7EB'
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#374151'
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Radar data={data} options={options} />
    </div>
  );
};