import React, { useState, useRef, useCallback } from 'react';
import { Upload, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import bunnyService from '../../services/bunnyService';

const BunnyVideoUpload = ({ 
  onUploadComplete, 
  onUploadError, 
  interviewId, 
  responseId, 
  questionText,
  maxSizeMB = 500,
  acceptedFormats = ['mp4', 'webm', 'ogg', 'avi', 'mov'],
  showPreview = true,
  autoUpload = false
}) => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success, error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  // Manipular seleção de arquivo
  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar arquivo
    const validation = bunnyService.validateVideoFile(file);
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      setUploadState('error');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setUploadState('idle');

    // Criar preview se habilitado
    if (showPreview) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    // Upload automático se habilitado
    if (autoUpload) {
      await handleUpload(file);
    }
  }, [showPreview, autoUpload]);

  // Manipular upload
  const handleUpload = useCallback(async (file = selectedFile) => {
    if (!file) {
      setError('Nenhum arquivo selecionado');
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);
    setError(null);

    try {
      const options = {
        title: `Entrevista ${interviewId} - Resposta ${responseId}`,
        description: questionText || `Resposta da pergunta ${responseId}`,
        tags: ['entrevista', 'resposta', `interview_${interviewId}`],
        collection: 'interviews'
      };

      const result = await bunnyService.uploadVideoWithProgress(
        file,
        options,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (result.success) {
        setUploadState('success');
        setUploadResult(result.data);
        setUploadProgress(100);

        // Callback de sucesso
        if (onUploadComplete) {
          onUploadComplete(result.data);
        }
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadState('error');
      setError(error.message);
      
      // Callback de erro
      if (onUploadError) {
        onUploadError(error);
      }
    }
  }, [selectedFile, interviewId, responseId, questionText, onUploadComplete, onUploadError]);

  // Controles do player
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const resetUpload = useCallback(() => {
    setUploadState('idle');
    setUploadProgress(0);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadResult(null);
    setError(null);
    setIsPlaying(false);
    setIsMuted(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  // Renderizar status do upload
  const renderUploadStatus = () => {
    switch (uploadState) {
      case 'uploading':
        return (
          <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Enviando vídeo...</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-blue-700 mt-1">{Math.round(uploadProgress)}% concluído</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">Upload concluído com sucesso!</p>
              <p className="text-xs text-green-700">Vídeo ID: {uploadResult?.videoId}</p>
            </div>
            <button
              onClick={resetUpload}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Erro no upload</p>
              <p className="text-xs text-red-700">{error}</p>
            </div>
            <button
              onClick={resetUpload}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Renderizar preview do vídeo
  const renderVideoPreview = () => {
    if (!showPreview || !previewUrl) return null;

    return (
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={previewUrl}
          className="w-full h-64 object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onVolumeChange={(e) => setIsMuted(e.target.muted)}
        />
        
        {/* Controles do player */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">
                {bunnyService.formatFileSize(selectedFile?.size || 0)}
              </span>
              
              <button
                onClick={() => videoRef.current?.requestFullscreen()}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Área de upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.map(format => `.${format}`).join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploadState === 'uploading'}
        />
        
        {!selectedFile ? (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Selecione um vídeo</h3>
              <p className="text-sm text-gray-500 mt-1">
                Formatos aceitos: {acceptedFormats.join(', ').toUpperCase()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Tamanho máximo: {maxSizeMB}MB
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={uploadState === 'uploading'}
            >
              Escolher Arquivo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-left">
              <h4 className="font-medium text-gray-900">{selectedFile.name}</h4>
              <p className="text-sm text-gray-500">
                {bunnyService.formatFileSize(selectedFile.size)} • {selectedFile.type}
              </p>
            </div>
            
            {!autoUpload && uploadState === 'idle' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleUpload()}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Enviar Vídeo
                </button>
                <button
                  onClick={resetUpload}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview do vídeo */}
      {renderVideoPreview()}

      {/* Status do upload */}
      {renderUploadStatus()}

      {/* Informações do resultado */}
      {uploadResult && uploadState === 'success' && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-gray-900">Detalhes do Upload</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Video ID:</span>
              <p className="font-mono text-xs">{uploadResult.videoId}</p>
            </div>
            <div>
              <span className="text-gray-500">Stream URL:</span>
              <p className="font-mono text-xs truncate">{uploadResult.streamUrl}</p>
            </div>
            <div>
              <span className="text-gray-500">Thumbnail:</span>
              <p className="font-mono text-xs truncate">{uploadResult.thumbnailUrl}</p>
            </div>
            <div>
              <span className="text-gray-500">Embed URL:</span>
              <p className="font-mono text-xs truncate">{uploadResult.embedUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BunnyVideoUpload;

