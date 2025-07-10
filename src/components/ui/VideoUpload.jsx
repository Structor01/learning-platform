import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Video, 
  X, 
  CheckCircle, 
  AlertCircle,
  Play,
  Trash2,
  Edit3,
  Save
} from 'lucide-react';

const VideoUpload = ({ onVideoUploaded, onBack }) => {
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    level: 'Iniciante',
    category: 'Desenvolvimento'
  });

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const file = files[0];
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      alert('Por favor, selecione apenas arquivos de vídeo.');
      return;
    }

    // Validar tamanho (máximo 500MB)
    if (file.size > 500 * 1024 * 1024) {
      alert('O arquivo é muito grande. Máximo permitido: 500MB.');
      return;
    }

    uploadVideo(file);
  };

  const uploadVideo = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular upload com progresso
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Criar URL do vídeo para preview
      const videoUrl = URL.createObjectURL(file);
      
      // Obter duração do vídeo
      const video = document.createElement('video');
      video.src = videoUrl;
      
      const duration = await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          const minutes = Math.floor(video.duration / 60);
          const seconds = Math.floor(video.duration % 60);
          resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        };
      });

      const newVideo = {
        id: Date.now(),
        file: file,
        url: videoUrl,
        title: videoForm.title || file.name.replace(/\.[^/.]+$/, ""),
        description: videoForm.description || 'Descrição do vídeo',
        instructor: videoForm.instructor || 'Instrutor',
        duration: duration,
        level: videoForm.level,
        category: videoForm.category,
        uploadDate: new Date().toLocaleDateString(),
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        status: 'processed'
      };

      setUploadedVideos(prev => [...prev, newVideo]);
      
      // Reset form
      setVideoForm({
        title: '',
        description: '',
        instructor: '',
        duration: '',
        level: 'Iniciante',
        category: 'Desenvolvimento'
      });

      if (onVideoUploaded) {
        onVideoUploaded(newVideo);
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload do vídeo. Tente novamente.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteVideo = (videoId) => {
    setUploadedVideos(prev => prev.filter(video => video.id !== videoId));
  };

  const startEditing = (video) => {
    setEditingVideo(video.id);
    setVideoForm({
      title: video.title,
      description: video.description,
      instructor: video.instructor,
      duration: video.duration,
      level: video.level,
      category: video.category
    });
  };

  const saveEdit = (videoId) => {
    setUploadedVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, ...videoForm }
        : video
    ));
    setEditingVideo(null);
    setVideoForm({
      title: '',
      description: '',
      instructor: '',
      duration: '',
      level: 'Iniciante',
      category: 'Desenvolvimento'
    });
  };

  const cancelEdit = () => {
    setEditingVideo(null);
    setVideoForm({
      title: '',
      description: '',
      instructor: '',
      duration: '',
      level: 'Iniciante',
      category: 'Desenvolvimento'
    });
  };

  const playVideo = (video) => {
    if (onVideoUploaded) {
      onVideoUploaded(video);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Player</h1>
            <p className="text-gray-600 mt-2">Gerencie e reproduza seus vídeos educacionais</p>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            ← Voltar ao Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload de Vídeo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drag and Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Arraste e solte seu vídeo aqui
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    ou clique para selecionar
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full"
                  >
                    Selecionar Arquivo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos suportados: MP4, AVI, MOV, WMV<br/>
                    Tamanho máximo: 500MB
                  </p>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fazendo upload...</span>
                      <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}

                {/* Video Information Form */}
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="title">Título do Vídeo</Label>
                    <Input
                      id="title"
                      value={videoForm.title}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Digite o título do vídeo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={videoForm.description}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o conteúdo do vídeo"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructor">Instrutor</Label>
                    <Input
                      id="instructor"
                      value={videoForm.instructor}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, instructor: e.target.value }))}
                      placeholder="Nome do instrutor"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="level">Nível</Label>
                      <select
                        id="level"
                        value={videoForm.level}
                        onChange={(e) => setVideoForm(prev => ({ ...prev, level: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Iniciante">Iniciante</option>
                        <option value="Intermediário">Intermediário</option>
                        <option value="Avançado">Avançado</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <select
                        id="category"
                        value={videoForm.category}
                        onChange={(e) => setVideoForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Desenvolvimento">Desenvolvimento</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Negócios">Negócios</option>
                        <option value="Liderança">Liderança</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Videos List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Vídeos Carregados ({uploadedVideos.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {uploadedVideos.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum vídeo carregado ainda</p>
                    <p className="text-sm text-gray-400">Faça upload do seu primeiro vídeo para começar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploadedVideos.map((video) => (
                      <div key={video.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          {/* Video Thumbnail */}
                          <div className="relative w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <video
                              src={video.url}
                              className="w-full h-full object-cover"
                              muted
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                          </div>

                          {/* Video Info */}
                          <div className="flex-1 min-w-0">
                            {editingVideo === video.id ? (
                              <div className="space-y-3">
                                <Input
                                  value={videoForm.title}
                                  onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                                  placeholder="Título do vídeo"
                                />
                                <Textarea
                                  value={videoForm.description}
                                  onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Descrição"
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <Input
                                    value={videoForm.instructor}
                                    onChange={(e) => setVideoForm(prev => ({ ...prev, instructor: e.target.value }))}
                                    placeholder="Instrutor"
                                    className="flex-1"
                                  />
                                  <select
                                    value={videoForm.level}
                                    onChange={(e) => setVideoForm(prev => ({ ...prev, level: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-md"
                                  >
                                    <option value="Iniciante">Iniciante</option>
                                    <option value="Intermediário">Intermediário</option>
                                    <option value="Avançado">Avançado</option>
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h3 className="font-semibold text-gray-900 truncate">{video.title}</h3>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{video.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>👨‍🏫 {video.instructor}</span>
                                  <span>⏱️ {video.duration}</span>
                                  <span>📊 {video.level}</span>
                                  <span>📁 {video.size}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {video.category}
                                  </Badge>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {editingVideo === video.id ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => saveEdit(video.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Save className="w-3 h-3" />
                                  Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEdit}
                                  className="flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" />
                                  Cancelar
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => playVideo(video)}
                                  className="flex items-center gap-1"
                                >
                                  <Play className="w-3 h-3" />
                                  Reproduzir
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditing(video)}
                                  className="flex items-center gap-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteVideo(video.id)}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Excluir
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="mt-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Processado e pronto para reprodução</span>
                          <Badge variant="secondary" className="text-xs">
                            Carregado em {video.uploadDate}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;

