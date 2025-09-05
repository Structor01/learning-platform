/**
 * Serviço para integração com Bunny.net no frontend
 * Gerencia upload de vídeos, streaming e player otimizado
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class BunnyService {
  constructor() {
    this.apiUrl = `${API_BASE_URL}/api/bunny`;
  }

  /**
   * Upload de vídeo para Bunny.net
   */
  async uploadVideo(videoFile, options = {}) {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      
      // Adicionar opções se fornecidas
      if (options.title) formData.append('title', options.title);
      if (options.description) formData.append('description', options.description);
      if (options.tags) formData.append('tags', JSON.stringify(options.tags));
      if (options.collection) formData.append('collection', options.collection);
      if (options.thumbnailTime) formData.append('thumbnailTime', options.thumbnailTime.toString());

      const response = await fetch(`${this.apiUrl}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          // Não definir Content-Type para FormData - o browser define automaticamente
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro no upload do vídeo');
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Erro no upload para Bunny.net:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload de vídeo com progresso
   */
  async uploadVideoWithProgress(videoFile, options = {}, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      
      // Adicionar opções
      if (options.title) formData.append('title', options.title);
      if (options.description) formData.append('description', options.description);
      if (options.tags) formData.append('tags', JSON.stringify(options.tags));
      if (options.collection) formData.append('collection', options.collection);
      if (options.thumbnailTime) formData.append('thumbnailTime', options.thumbnailTime.toString());

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Monitorar progresso do upload
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              onProgress(percentComplete);
            }
          });
        }

        xhr.addEventListener('load', () => {
          try {
            const result = JSON.parse(xhr.responseText);
            
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve({
                success: true,
                data: result.data
              });
            } else {
              reject(new Error(result.message || 'Erro no upload'));
            }
          } catch (error) {
            reject(new Error('Erro ao processar resposta do servidor'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Erro de rede durante o upload'));
        });

        xhr.open('POST', `${this.apiUrl}/upload`);
        xhr.send(formData);
      });

    } catch (error) {
      console.error('Erro no upload com progresso:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter informações de um vídeo
   */
  async getVideoInfo(videoId) {
    try {
      const response = await fetch(`${this.apiUrl}/video/${videoId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao obter informações do vídeo');
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Erro ao obter informações do vídeo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verificar status de processamento do vídeo
   */
  async getVideoStatus(videoId) {
    try {
      const response = await fetch(`${this.apiUrl}/video/${videoId}/status`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao verificar status');
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Deletar vídeo
   */
  async deleteVideo(videoId) {
    try {
      const response = await fetch(`${this.apiUrl}/video/${videoId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao deletar vídeo');
      }

      return {
        success: true,
        message: result.message
      };

    } catch (error) {
      console.error('Erro ao deletar vídeo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Listar vídeos
   */
  async listVideos(page = 1, limit = 20) {
    try {
      const response = await fetch(`${this.apiUrl}/videos?page=${page}&limit=${limit}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao listar vídeos');
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Erro ao listar vídeos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Testar conexão com Bunny.net
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.apiUrl}/test-connection`);
      const result = await response.json();

      return {
        success: result.success,
        message: result.message,
        configured: result.configured
      };

    } catch (error) {
      console.error('Erro no teste de conexão:', error);
      return {
        success: false,
        message: error.message,
        configured: false
      };
    }
  }

  /**
   * Obter estatísticas da biblioteca
   */
  async getLibraryStats() {
    try {
      const response = await fetch(`${this.apiUrl}/stats`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao obter estatísticas');
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gerar URL de embed
   */
  async getEmbedUrl(videoId) {
    try {
      const response = await fetch(`${this.apiUrl}/video/${videoId}/embed-url`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao gerar URL de embed');
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Erro ao gerar URL de embed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Health check do serviço
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      const result = await response.json();

      return {
        success: result.success,
        message: result.message,
        status: result.status,
        configured: result.configured
      };

    } catch (error) {
      console.error('Erro no health check:', error);
      return {
        success: false,
        message: error.message,
        status: 'error',
        configured: false
      };
    }
  }

  /**
   * Validar arquivo de vídeo
   */
  validateVideoFile(file) {
    const errors = [];

    // Verificar se é um arquivo
    if (!file) {
      errors.push('Nenhum arquivo selecionado');
      return { valid: false, errors };
    }

    // Verificar tipo de arquivo
    if (!file.type.startsWith('video/')) {
      errors.push('Arquivo deve ser um vídeo');
    }

    // Verificar tamanho (500MB máximo)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      errors.push('Arquivo muito grande. Máximo: 500MB');
    }

    // Verificar formatos suportados
    const supportedFormats = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/mkv'
    ];

    if (!supportedFormats.includes(file.type)) {
      errors.push('Formato não suportado. Use: MP4, WebM, OGG, AVI, MOV, WMV, FLV, MKV');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatar tamanho de arquivo
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formatar duração de vídeo
   */
  formatDuration(seconds) {
    if (!seconds || seconds === 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Gerar thumbnail a partir de vídeo
   */
  generateVideoThumbnail(videoFile, timeInSeconds = 1) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      });

      video.addEventListener('seeked', () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });

      video.addEventListener('error', reject);

      video.src = URL.createObjectURL(videoFile);
      video.currentTime = timeInSeconds;
    });
  }
}

// Instância singleton
const bunnyService = new BunnyService();

export default bunnyService;

