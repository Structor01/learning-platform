import axios from 'axios';
import { API_URL } from '../components/utils/api';

/**
 * Serviço para gerenciar o progresso do usuário nos cursos
 */
class CourseProgressService {
  /**
   * Marca uma aula como concluída
   * @param {number} userId - ID do usuário
   * @param {number} lessonId - ID da aula
   * @param {number} trilhaId - ID da trilha
   */
  async markLessonAsCompleted(userId, lessonId, trilhaId) {
    try {
      const payload = {
        userId: Number(userId),
        lessonId: Number(lessonId),
        trilhaId: Number(trilhaId),
        completedAt: new Date().toISOString()
      };

      const response = await axios.post(`${API_URL}/api/progress/lesson`, payload);
      return response.data;
    } catch (error) {
      // Silenciosamente continuar - já está salvando no localStorage
      return null;
    }
  }

  /**
   * Busca o progresso do usuário em uma trilha
   * @param {number} userId - ID do usuário
   * @param {number} trilhaId - ID da trilha
   */
  async getProgressByTrilha(userId, trilhaId) {
    try {
      const url = `${API_URL}/api/progress/trilha/${trilhaId}/user/${userId}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      // Retornar dados vazios em caso de erro
      return { completedLessons: [], progress: 0, isCompleted: false };
    }
  }

  /**
   * Verifica se uma aula está concluída
   * @param {number} userId - ID do usuário
   * @param {number} lessonId - ID da aula
   */
  async isLessonCompleted(userId, lessonId) {
    try {
      const response = await axios.get(`${API_URL}/api/progress/lesson/${lessonId}/user/${userId}`);
      return response.data.isCompleted;
    } catch (error) {
      console.error('Erro ao verificar conclusão da aula:', error);
      return false;
    }
  }

  /**
   * Gera um certificado para o usuário
   * @param {number} userId - ID do usuário
   * @param {number} trilhaId - ID da trilha
   */
  async generateCertificate(userId, trilhaId) {
    try {
      const response = await axios.post(`${API_URL}/api/certificates/generate`, {
        userId,
        trilhaId,
        issuedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
      throw error;
    }
  }

  /**
   * Busca certificados do usuário
   * @param {number} userId - ID do usuário
   */
  async getUserCertificates(userId) {
    try {
      const response = await axios.get(`${API_URL}/api/certificates/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar certificados:', error);
      return [];
    }
  }

  /**
   * Calcula o progresso de uma trilha
   * @param {Array} modules - Lista de módulos
   * @param {Array} completedLessons - Lista de IDs de aulas concluídas
   */
  calculateProgress(modules, completedLessons = []) {
    const totalLessons = modules.reduce((total, module) => {
      return total + (module.lessons?.length || 0);
    }, 0);

    if (totalLessons === 0) return 0;

    const completedCount = completedLessons.length;
    return Math.round((completedCount / totalLessons) * 100);
  }

  /**
   * Verifica se a trilha está completa
   * @param {Array} modules - Lista de módulos
   * @param {Array} completedLessons - Lista de IDs de aulas concluídas
   */
  isCourseComplete(modules, completedLessons = []) {
    const allLessonIds = modules.reduce((ids, module) => {
      const lessonIds = module.lessons?.map(lesson => lesson.id) || [];
      return [...ids, ...lessonIds];
    }, []);

    if (allLessonIds.length === 0) return false;

    return allLessonIds.every(lessonId => completedLessons.includes(lessonId));
  }

  /**
   * Salva progresso no localStorage (backup offline)
   */
  saveProgressLocally(userId, trilhaId, lessonId) {
    const key = `progress_${userId}_${trilhaId}`;
    const existingProgress = JSON.parse(localStorage.getItem(key) || '[]');

    if (!existingProgress.includes(lessonId)) {
      existingProgress.push(lessonId);
      localStorage.setItem(key, JSON.stringify(existingProgress));
    }
  }

  /**
   * Recupera progresso do localStorage
   */
  getLocalProgress(userId, trilhaId) {
    const key = `progress_${userId}_${trilhaId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
}

export default new CourseProgressService();
