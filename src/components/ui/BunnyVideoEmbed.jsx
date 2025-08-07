import React, { useState, useRef, useEffect } from 'react';
import { Play, Loader, AlertCircle, Maximize, ExternalLink } from 'lucide-react';

const BunnyVideoEmbed = ({ 
  videoId,
  libraryId,
  embedUrl,
  thumbnailUrl,
  title,
  width = '100%',
  height = '400px',
  autoplay = false,
  muted = false,
  controls = true,
  responsive = true,
  className = '',
  onLoad,
  onError,
  onPlay,
  onPause
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(!autoplay);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // Gerar URL de embed com parâmetros
  const generateEmbedUrl = () => {
    if (embedUrl) return embedUrl;
    
    if (!videoId || !libraryId) return null;

    const baseUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
    const params = new URLSearchParams();

    if (autoplay) params.append('autoplay', 'true');
    if (muted) params.append('muted', 'true');
    if (!controls) params.append('controls', 'false');

    const paramString = params.toString();
    return paramString ? `${baseUrl}?${paramString}` : baseUrl;
  };

  const finalEmbedUrl = generateEmbedUrl();

  // Controle de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handlers
  const handleIframeLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleIframeError = () => {
    setIsLoaded(false);
    setHasError(true);
    onError?.();
  };

  const handlePlayClick = () => {
    setShowThumbnail(false);
    onPlay?.();
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (isFullscreen) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.error('Erro ao alternar fullscreen:', error);
    }
  };

  const openInNewTab = () => {
    if (finalEmbedUrl) {
      window.open(finalEmbedUrl, '_blank');
    }
  };

  // Estilos responsivos
  const containerStyle = {
    width,
    height: responsive ? 'auto' : height,
    aspectRatio: responsive ? '16/9' : undefined,
  };

  // Renderizar thumbnail com botão play
  const renderThumbnail = () => {
    if (!showThumbnail || !thumbnailUrl) return null;

    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center cursor-pointer group">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={title || 'Video thumbnail'}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Overlay com botão play */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
          <button
            onClick={handlePlayClick}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transform group-hover:scale-110 transition-transform"
          >
            <Play className="w-8 h-8 ml-1" />
          </button>
        </div>

        {/* Título */}
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-white font-medium">{title}</h3>
          </div>
        )}

        {/* Controles do thumbnail */}
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
          >
            <Maximize className="w-4 h-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              openInNewTab();
            }}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Renderizar loading
  const renderLoading = () => {
    if (isLoaded || hasError || showThumbnail) return null;

    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Loader className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Carregando vídeo...</p>
        </div>
      </div>
    );
  };

  // Renderizar erro
  const renderError = () => {
    if (!hasError) return null;

    return (
      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium mb-2">Erro ao carregar vídeo</h3>
          <p className="text-sm text-gray-300 mb-4">
            Não foi possível carregar o vídeo. Verifique sua conexão.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setShowThumbnail(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  };

  // Renderizar iframe
  const renderIframe = () => {
    if (showThumbnail || hasError || !finalEmbedUrl) return null;

    return (
      <iframe
        ref={iframeRef}
        src={finalEmbedUrl}
        title={title || 'Bunny Video Player'}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    );
  };

  // Renderizar controles do embed
  const renderEmbedControls = () => {
    if (showThumbnail || hasError) return null;

    return (
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={toggleFullscreen}
          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
        >
          <Maximize className="w-4 h-4" />
        </button>
        
        <button
          onClick={openInNewTab}
          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (!finalEmbedUrl) {
    return (
      <div 
        className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}
        style={containerStyle}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Vídeo não disponível</h3>
            <p className="text-sm text-gray-300">
              ID do vídeo ou biblioteca não fornecido.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      style={containerStyle}
    >
      {/* Iframe do vídeo */}
      {renderIframe()}

      {/* Thumbnail com play button */}
      {renderThumbnail()}

      {/* Loading state */}
      {renderLoading()}

      {/* Error state */}
      {renderError()}

      {/* Controles do embed */}
      {renderEmbedControls()}

      {/* Informações do vídeo */}
      {title && !showThumbnail && isLoaded && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <h3 className="text-white font-medium truncate">{title}</h3>
        </div>
      )}
    </div>
  );
};

export default BunnyVideoEmbed;

