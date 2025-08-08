import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward,
  Settings,
  Download,
  Share2,
  Loader,
  AlertCircle
} from 'lucide-react';

const BunnyVideoPlayer = ({ 
  videoId,
  streamUrl,
  thumbnailUrl,
  embedUrl,
  title,
  autoplay = false,
  controls = true,
  muted = false,
  loop = false,
  width = '100%',
  height = 'auto',
  className = '',
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onLoadStart,
  onLoadedData,
  onError
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Inicializar player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Event listeners
    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
      onLoadStart?.();
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
      onLoadedData?.();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    const handleError = (error) => {
      setIsLoading(false);
      setHasError(true);
      onError?.(error);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    // Adicionar listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('volumechange', handleVolumeChange);

    // Cleanup
    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [onPlay, onPause, onEnded, onTimeUpdate, onLoadStart, onLoadedData, onError]);

  // Controle de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (!controls) return;

    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      setShowControls(true);
      
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    resetControlsTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, controls]);

  // Controles do player
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
  }, [isMuted]);

  const changeVolume = useCallback((newVolume) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
  }, []);

  const seek = useCallback((time) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
  }, []);

  const skipBackward = useCallback(() => {
    seek(Math.max(0, currentTime - 10));
  }, [currentTime, seek]);

  const skipForward = useCallback(() => {
    seek(Math.min(duration, currentTime + 10));
  }, [currentTime, duration, seek]);

  const toggleFullscreen = useCallback(async () => {
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
  }, [isFullscreen]);

  const changePlaybackRate = useCallback((rate) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  // Formatação de tempo
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Renderizar controles
  const renderControls = () => {
    if (!controls || (!showControls && isPlaying)) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
        {/* Barra de progresso */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
            />
            <div 
              className="absolute top-0 left-0 h-1 bg-red-500 rounded-lg pointer-events-none"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Controles principais */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-gray-300 transition-colors"
              disabled={isLoading || hasError}
            >
              {isLoading ? (
                <Loader className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            {/* Skip controls */}
            <button
              onClick={skipBackward}
              className="text-white hover:text-gray-300 transition-colors"
              disabled={isLoading || hasError}
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={skipForward}
              className="text-white hover:text-gray-300 transition-colors"
              disabled={isLoading || hasError}
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Tempo */}
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Configurações */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettings && (
                <div className="absolute bottom-8 right-0 bg-black/90 rounded-lg p-3 min-w-48">
                  <div className="space-y-3">
                    {/* Velocidade */}
                    <div>
                      <label className="text-white text-xs font-medium">Velocidade</label>
                      <select
                        value={playbackRate}
                        onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                        className="w-full mt-1 bg-white/20 text-white text-xs rounded px-2 py-1"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>Normal</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                    </div>

                    {/* Qualidade */}
                    <div>
                      <label className="text-white text-xs font-medium">Qualidade</label>
                      <select
                        value={quality}
                        onChange={(e) => setQuality(e.target.value)}
                        className="w-full mt-1 bg-white/20 text-white text-xs rounded px-2 py-1"
                      >
                        <option value="auto">Auto</option>
                        <option value="1080p">1080p</option>
                        <option value="720p">720p</option>
                        <option value="480p">480p</option>
                        <option value="360p">360p</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Download */}
            {streamUrl && (
              <a
                href={streamUrl}
                download
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Download className="w-5 h-5" />
              </a>
            )}

            {/* Share */}
            <button
              onClick={() => navigator.share?.({ url: embedUrl, title })}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar overlay de erro
  const renderError = () => {
    if (!hasError) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80">
        <div className="text-center text-white">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium mb-2">Erro ao carregar vídeo</h3>
          <p className="text-sm text-gray-300">
            Não foi possível reproduzir este vídeo. Verifique sua conexão.
          </p>
        </div>
      </div>
    );
  };

  // Renderizar loading
  const renderLoading = () => {
    if (!isLoading || hasError) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
        <div className="text-center text-white">
          <Loader className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Carregando vídeo...</p>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      style={{ width, height }}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Vídeo principal */}
      <video
        ref={videoRef}
        src={streamUrl}
        poster={thumbnailUrl}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      {/* Overlays */}
      {renderLoading()}
      {renderError()}
      {renderControls()}

      {/* Título do vídeo */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <h3 className="text-white font-medium truncate">{title}</h3>
        </div>
      )}
    </div>
  );
};

export default BunnyVideoPlayer;

