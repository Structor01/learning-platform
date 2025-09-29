import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const LiderancaChart = ({ liderancaData }) => {
  // Dados padrão se não forem fornecidos
  const defaultData = {
    modelador: 54,
    democratico: 57,
    afiliativo: 52,
    treinador: 57,
    visionario: 65,
    autoritario: 29
  };

  const scores = liderancaData || defaultData;

  const data = {
    labels: ['Modelador', 'Democrático', 'Afiliativo', 'Treinador', 'Visionário', 'Autoritário'],
    datasets: [
      {
        label: 'Percentual',
        data: [
          scores.modelador,
          scores.democratico,
          scores.afiliativo,
          scores.treinador,
          scores.visionario,
          scores.autoritario
        ],
        backgroundColor: [
          '#8B5CF6', // Roxo
          '#3B82F6', // Azul
          '#10B981', // Verde
          '#F59E0B', // Amarelo
          '#EF4444', // Vermelho
          '#6B7280'  // Cinza
        ],
        borderColor: [
          '#7C3AED',
          '#2563EB',
          '#059669',
          '#D97706',
          '#DC2626',
          '#4B5563'
        ],
        borderWidth: 1,
        borderRadius: 4
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
            return `${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        },
        grid: {
          color: '#E5E7EB'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};