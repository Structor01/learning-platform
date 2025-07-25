import React, { useEffect, useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { User, Smile, Calendar, Eye, Brain, Heart } from 'lucide-react';

const FaceAnalysis = ({ videoRef, isActive }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [faceData, setFaceData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const intervalRef = useRef(null);

  // Carregar modelos do face-api.js
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.ageGenderNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setIsLoaded(true);
        console.log('Modelos de análise facial carregados com sucesso');
      } catch (error) {
        console.error('Erro ao carregar modelos:', error);
      }
    };

    loadModels();
  }, []);

  // Função para analisar o rosto
  const analyzeFace = async () => {
    if (!isLoaded || !videoRef.current || !isActive) return;

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withAgeAndGender()
        .withFaceExpressions();

      if (detections.length > 0) {
        const detection = detections[0];
        
        // Encontrar a expressão dominante
        const expressions = detection.expressions;
        const dominantExpression = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );

        // Mapear expressões para português
        const expressionMap = {
          happy: 'Feliz',
          sad: 'Triste',
          angry: 'Irritado',
          fearful: 'Amedrontado',
          disgusted: 'Desgostoso',
          surprised: 'Surpreso',
          neutral: 'Neutro'
        };

        // Mapear gênero para português
        const genderMap = {
          male: 'Masculino',
          female: 'Feminino'
        };

        setFaceData({
          gender: genderMap[detection.gender] || detection.gender,
          age: Math.round(detection.age),
          expression: expressionMap[dominantExpression] || dominantExpression,
          confidence: Math.round(expressions[dominantExpression] * 100),
          expressions: expressions,
          genderProbability: Math.round(detection.genderProbability * 100)
        });
      } else {
        setFaceData(null);
      }
    } catch (error) {
      console.error('Erro na análise facial:', error);
    }
  };

  // Iniciar/parar análise
  useEffect(() => {
    if (isActive && isLoaded) {
      setIsAnalyzing(true);
      intervalRef.current = setInterval(analyzeFace, 1000); // Analisar a cada 1 segundo
    } else {
      setIsAnalyzing(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isLoaded]);

  // Função para obter cor da emoção
  const getEmotionColor = (emotion) => {
    const colors = {
      'Feliz': 'text-green-400',
      'Triste': 'text-blue-400',
      'Irritado': 'text-red-400',
      'Amedrontado': 'text-purple-400',
      'Desgostoso': 'text-yellow-400',
      'Surpreso': 'text-orange-400',
      'Neutro': 'text-gray-400'
    };
    return colors[emotion] || 'text-gray-400';
  };

  // Função para obter ícone da emoção
  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'Feliz': return '😊';
      case 'Triste': return '😢';
      case 'Irritado': return '😠';
      case 'Amedrontado': return '😨';
      case 'Desgostoso': return '🤢';
      case 'Surpreso': return '😲';
      case 'Neutro': return '😐';
      default: return '🤔';
    }
  };

  if (!isLoaded) {
    return (
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="h-5 w-5 text-purple-400 animate-pulse" />
          <span className="text-gray-300">Carregando análise facial...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-400" />
          Análise Facial
        </h3>
        <div className="flex items-center space-x-2">
          {isAnalyzing && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
          <span className="text-xs text-gray-400">
            {isAnalyzing ? 'Analisando...' : 'Pausado'}
          </span>
        </div>
      </div>

      {faceData ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Gênero */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <User className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Gênero</span>
            </div>
            <div className="text-white font-semibold">{faceData.gender}</div>
            <div className="text-xs text-gray-400">{faceData.genderProbability}% confiança</div>
          </div>

          {/* Idade */}
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Idade</span>
            </div>
            <div className="text-white font-semibold">{faceData.age} anos</div>
            <div className="text-xs text-gray-400">Estimativa</div>
          </div>

          {/* Emoção Principal */}
          <div className="bg-gray-700 rounded-lg p-3 col-span-2">
            <div className="flex items-center space-x-2 mb-2">
              <Smile className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">Emoção Dominante</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getEmotionIcon(faceData.expression)}</span>
              <div>
                <div className={`font-semibold ${getEmotionColor(faceData.expression)}`}>
                  {faceData.expression}
                </div>
                <div className="text-xs text-gray-400">{faceData.confidence}% confiança</div>
              </div>
            </div>
          </div>

          {/* Todas as Emoções */}
          <div className="bg-gray-700 rounded-lg p-3 col-span-2">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-gray-300">Análise Emocional</span>
            </div>
            <div className="space-y-1">
              {Object.entries(faceData.expressions).map(([emotion, value]) => {
                const emotionPt = {
                  happy: 'Feliz',
                  sad: 'Triste',
                  angry: 'Irritado',
                  fearful: 'Amedrontado',
                  disgusted: 'Desgostoso',
                  surprised: 'Surpreso',
                  neutral: 'Neutro'
                }[emotion] || emotion;

                const percentage = Math.round(value * 100);
                
                return (
                  <div key={emotion} className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">{emotionPt}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-600 rounded-full h-1">
                        <div 
                          className="bg-purple-400 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400 w-8">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Eye className="h-12 w-12 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400">Nenhum rosto detectado</p>
          <p className="text-xs text-gray-500 mt-1">
            Posicione-se de frente para a câmera
          </p>
        </div>
      )}

      {/* Informações adicionais */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Atualização: 1s</span>
          <span>IA: Face-api.js</span>
        </div>
      </div>
    </div>
  );
};

export default FaceAnalysis;

