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
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Paywall from './Paywall';
import StripeCheckout from './StripeCheckout';

const VideoPlayer = ({ course, onBack }) => {
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
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const hasAccess = canAccessContent();
  const previewDuration = 180; // 3 minutos de preview para usuários gratuitos

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  // Controlar preview para usuários gratuitos
  useEffect(() => {
    if (!hasAccess && currentTime >= previewDuration) {
      setIsPlaying(false);
      setShowPaywall(true);
    }
  }, [currentTime, hasAccess]);

  const togglePlay = () => {
    if (!hasAccess && currentTime >= previewDuration) {
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
    if (!hasAccess) {
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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
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
    // Usuário agora tem acesso, pode continuar assistindo
  };

  const getProgressPercentage = () => {
    if (!hasAccess) {
      return Math.min((currentTime / previewDuration) * 100, 100);
    }
    return (currentTime / duration) * 100;
  };

  const getMaxProgress = () => {
    if (!hasAccess) {
      return (previewDuration / duration) * 100;
    }
    return 100;
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Video Container */}
      <div 
        className="relative w-full h-screen"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster="/api/placeholder/1920/1080"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src="/api/placeholder/video" type="video/mp4" />
        </video>

        {/* Preview Overlay for Free Users */}
        {!hasAccess && (
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
              <Crown className="w-4 h-4 mr-2" />
              Preview - {Math.max(0, Math.floor((previewDuration - currentTime) / 60))}:{Math.max(0, Math.floor((previewDuration - currentTime) % 60)).toString().padStart(2, '0')} restantes
            </Badge>
          </div>
        )}

        {/* Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
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
              {!hasAccess && (
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
                  {!hasAccess && (
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
                {!hasAccess && (
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
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="w-5 h-5" />
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
              </div>

              <div className="flex items-center gap-2">
                {!hasAccess && (
                  <Button
                    onClick={() => setShowPaywall(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Assinar para Continuar
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-5 h-5" />
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
                <span>⭐ {course.rating}</span>
              </div>
            </div>

            <div className="space-y-4">
              {!hasAccess && (
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

