import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ArrowLeft, 
  BookmarkPlus, 
  Heart, 
  CheckCircle,
  Clock,
  User
} from 'lucide-react'

const VideoPlayer = () => {
  const { id } = useParams()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(1234) // 20:34 in seconds
  const [duration, setDuration] = useState(2420) // 40:20 in seconds
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef(null)

  // Mock course data
  const course = {
    id: id,
    title: 'Liderança Estratégica para Perfil Dominante',
    instructor: 'Bruno Nardon',
    duration: '45 min',
    module: '3 de 8',
    description: 'Aprenda técnicas avançadas de liderança estratégica especialmente desenvolvidas para profissionais com perfil DISC Dominante.',
    nextCourse: {
      id: 2,
      title: 'Delegação Eficaz',
      thumbnail: '/api/placeholder/200/120',
      duration: '32 min'
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    setCurrentTime(Math.floor(newTime))
  }

  const progress = (currentTime / duration) * 100

  useEffect(() => {
    let interval
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + 1, duration))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player */}
      <div className="relative">
        {/* Video Container */}
        <div 
          className="relative w-full h-[60vh] bg-gray-900 flex items-center justify-center"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Simulated Video Content */}
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bruno Nardon</h3>
              <p className="text-gray-300">Especialista em Liderança Estratégica</p>
            </div>
          </div>

          {/* Video Controls */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
              {/* Progress Bar */}
              <div 
                className="w-full h-1 bg-gray-600 rounded-full mb-4 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="text-white hover:bg-white hover:bg-opacity-20"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </Button>
                  
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVolumeToggle}
                    className="text-white hover:bg-white hover:bg-opacity-20"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Back Button */}
          <Link to="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 left-4 text-white hover:bg-white hover:bg-opacity-20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>

      {/* Course Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="text-white mb-6">
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <div className="flex items-center space-x-4 text-gray-300 mb-4">
                <span>Por {course.instructor}</span>
                <span>•</span>
                <span>{course.duration}</span>
                <span>•</span>
                <span>Módulo {course.module}</span>
              </div>
              <p className="text-gray-300 leading-relaxed">{course.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 mb-8">
              <Button className="bg-white text-black hover:bg-gray-100">
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como concluído
              </Button>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Adicionar às notas
              </Button>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                <Heart className="w-4 h-4 mr-2" />
                Favoritar
              </Button>
            </div>

            {/* Resources */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-white text-lg font-semibold mb-4">Recursos adicionais</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PDF</span>
                    </div>
                    <span className="text-white">Guia de Liderança Estratégica</span>
                  </div>
                  <Button size="sm" variant="outline" className="border-gray-600 text-white">
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">LINK</span>
                    </div>
                    <span className="text-white">Artigo complementar</span>
                  </div>
                  <Button size="sm" variant="outline" className="border-gray-600 text-white">
                    Acessar
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">QUIZ</span>
                    </div>
                    <span className="text-white">Teste seus conhecimentos</span>
                  </div>
                  <Button size="sm" variant="outline" className="border-gray-600 text-white">
                    Iniciar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Próximo conteúdo</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="w-full h-32 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Play className="w-8 h-8 text-white opacity-60" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-black text-white">
                      {course.nextCourse.duration}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">{course.nextCourse.title}</h4>
                    <p className="text-gray-400 text-sm mb-3">Próximo na trilha</p>
                    <Link to={`/video/${course.nextCourse.id}`}>
                      <Button className="w-full bg-white text-black hover:bg-gray-100">
                        <Play className="w-4 h-4 mr-2" />
                        Reproduzir
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer

