import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Settings,
  Crown,
  Lock,
  Minimize,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Paywall from './Paywall';
import StripeCheckout from './StripeCheckout';

const VideoPlayer = ({ course, onBack, isSmartPlayer = false }) => {
  const { canAccessContent } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const hasAccess = canAccessContent();
  const previewDuration = isSmartPlayer ? Infinity : 180; // Smart Player não tem limitação

  // Proteções contra DevTools e captura
  useEffect(() => {
    // Desabilitar teclas de atalho perigosas
    const handleKeyDown = (e) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'a') // Ctrl+A para selecionar tudo
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Desabilitar menu de contexto
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Detectar abertura do DevTools
    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        console.clear();
        ('%cAcesso não autorizado detectado!', 'color: red; font-size: 20px; font-weight: bold;');
      }
    };

    // Adicionar event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    // Verificar DevTools periodicamente
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      clearInterval(devToolsInterval);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setError('Erro ao carregar o vídeo');
      setIsLoading(false);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [course]);

  // Controlar preview para usuários gratuitos (apenas para cursos normais)
  useEffect(() => {
    if (!isSmartPlayer && !hasAccess && currentTime >= previewDuration) {
      setIsPlaying(false);
      setShowPaywall(true);
    }
  }, [currentTime, hasAccess, isSmartPlayer]);

  const togglePlay = () => {
    if (!isSmartPlayer && !hasAccess && currentTime >= previewDuration) {
      setShowPaywall(true);
      return;
    }

    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };

  const handleSeek = (e) => {
    if (!isSmartPlayer && !hasAccess) {
      const seekTime = (e.target.value / 100) * duration;
      if (seekTime > previewDuration) {
        setShowPaywall(true);
        return;
      }
    }

    const video = videoRef.current;
    const seekTime = (e.target.value / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const skipForward = () => {
    const video = videoRef.current;
    video.currentTime = Math.min(duration, video.currentTime + 10);
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    videoRef.current.playbackRate = nextRate;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const downloadVideo = () => {
    // Funcionalidade de download removida por segurança
    ('Download não permitido');
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowPaywall(false);
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setShowPaywall(false);
  };

  const getProgressPercentage = () => {
    if (!isSmartPlayer && !hasAccess) {
      return Math.min((currentTime / previewDuration) * 100, 100);
    }
    return (currentTime / duration) * 100;
  };

  const getMaxProgress = () => {
    if (!isSmartPlayer && !hasAccess) {
      return (previewDuration / duration) * 100;
    }
    return 100;
  };

  // Determinar a fonte do vídeo
  const getVideoSource = () => {
    if (course.url) {
      return course.url; // Vídeo carregado pelo usuário
    }
    return "/api/placeholder/video"; // Vídeo placeholder
  };

  return (
    <div
      className="min-h-screen bg-black text-white pt-20"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onSelectStart={(e) => e.preventDefault()}
    >
      {/* Video Container */}
      <div
        ref={containerRef}
        className="relative w-full h-screen"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Carregando vídeo...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-white text-xl mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          </div>
        )}

        {/* Overlay de proteção contra captura */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'transparent',
            mixBlendMode: 'multiply'
          }}
        >
          {/* Marca d'água invisível */}
          <div className="absolute inset-0 opacity-0 select-none">
            <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold rotate-45">
              GSkills Protected Content
            </div>
          </div>
        </div>

        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain bg-black"
          poster={course.thumbnail || "/api/placeholder/1920/1080"}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onError={() => setError('Erro ao carregar o vídeo')}
          onContextMenu={(e) => e.preventDefault()} // Desabilita menu de contexto
          controlsList="nodownload nofullscreen noremoteplayback" // Remove controles de download
          disablePictureInPicture // Desabilita picture-in-picture
          crossOrigin="anonymous"
          style={{
            userSelect: 'none', // Impede seleção
            pointerEvents: isPlaying ? 'none' : 'auto' // Desabilita interação durante reprodução
          }}
        >
          <source src={getVideoSource()} type="video/mp4" />
          Seu navegador não suporta o elemento de vídeo.
        </video>

        {/* Preview Overlay for Free Users (apenas para cursos normais) */}
        {!isSmartPlayer && !hasAccess && (
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
              <Crown className="w-4 h-4 mr-2" />
              Preview - {Math.max(0, Math.floor((previewDuration - currentTime) / 60))}:{Math.max(0, Math.floor((previewDuration - currentTime) % 60)).toString().padStart(2, '0')} restantes
            </Badge>
          </div>
        )}

        {/* Smart Player Badge */}
        {isSmartPlayer && (
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2">
              🎬 Smart Player
            </Badge>
          </div>
        )}

        {/* Controls Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              ← Voltar
            </Button>

            <div className="text-center">
              <h1 className="text-xl font-semibold">{course.title}</h1>
              <p className="text-white/70 text-sm">Por {course.instructor}</p>
            </div>

            <div className="flex items-center gap-2">
              {!isSmartPlayer && !hasAccess && (
                <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                  <Lock className="w-3 h-3 mr-1" />
                  Limitado
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={togglePlay}
              size="lg"
              className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="relative">
                {/* Background Track */}
                <div className="w-full h-1 bg-white/30 rounded-full">
                  {/* Max Progress for Free Users */}
                  {!isSmartPlayer && !hasAccess && (
                    <div
                      className="absolute top-0 left-0 h-1 bg-white/50 rounded-full"
                      style={{ width: `${getMaxProgress()}%` }}
                    />
                  )}
                  {/* Current Progress */}
                  <div
                    className="h-1 bg-white rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>

                {/* Preview Limit Indicator */}
                {!isSmartPlayer && !hasAccess && (
                  <div
                    className="absolute top-0 w-3 h-3 bg-yellow-400 rounded-full transform -translate-y-1 -translate-x-1.5 border-2 border-black"
                    style={{ left: `${getMaxProgress()}%` }}
                  />
                )}
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={getProgressPercentage()}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={togglePlay}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  onClick={skipBackward}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  title="Voltar 10s"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>

                <Button
                  onClick={skipForward}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  title="Avançar 10s"
                >
                  <RotateCw className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleMute}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <span className="text-white/70 text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <Button
                  onClick={changePlaybackRate}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 text-sm"
                  title="Velocidade de reprodução"
                >
                  {playbackRate}x
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {!isSmartPlayer && !hasAccess && (
                  <Button
                    onClick={() => setShowPaywall(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Assinar para Continuar
                  </Button>
                )}

                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Info */}
      <div className="bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
              <p className="text-gray-300 mb-6">{course.description}</p>

              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>👨‍🏫 {course.instructor}</span>
                <span>⏱️ {course.duration}</span>
                <span>📊 {course.level}</span>
                {course.rating && <span>⭐ {course.rating}</span>}
                {course.size && <span>📁 {course.size}</span>}
                {course.uploadDate && <span>📅 {course.uploadDate}</span>}
              </div>

              {isSmartPlayer && (
                <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                  <h3 className="text-blue-300 font-semibold mb-2">🎬 Smart Player Ativo</h3>
                  <p className="text-blue-100 text-sm">
                    Você está usando o Smart Player com funcionalidades avançadas:
                    controle de velocidade, qualidade adaptativa e proteção avançada contra cópia.
                    O conteúdo está protegido contra download e captura não autorizada.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {!isSmartPlayer && !hasAccess && (
                <Card className="bg-gradient-to-r from-purple-900 to-pink-900 border-purple-500">
                  <CardContent className="p-6 text-center">
                    <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-white mb-2">
                      Desbloqueie o Curso Completo
                    </h3>
                    <p className="text-purple-100 text-sm mb-4">
                      Acesse todo o conteúdo, certificação e suporte
                    </p>
                    <Button
                      onClick={() => setShowPaywall(true)}
                      className="w-full bg-white text-purple-900 hover:bg-gray-100"
                    >
                      Ver Planos
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <Paywall
          contentTitle={course.title}
          contentType="curso"
          onClose={() => setShowPaywall(false)}
          onSubscribe={handleSubscribe}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && selectedPlan && (
        <StripeCheckout
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setShowCheckout(false);
            setShowPaywall(true);
          }}
        />
      )}
    </div>
  );
};

export default VideoPlayer;

