// src/components/ui/NewVideoModal.jsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';

const schema = z
  .object({
    title: z.string().min(1, 'Título obrigatório'),
    description: z.string().optional(),
    youtubeUrl: z.string().url('URL inválida').optional(),
    file: z
      .any()
      .refine((f) => f?.length === 1, 'Selecione um arquivo')
      .optional(),
  })
  .refine(
    (data) => data.youtubeUrl || data.file,
    'Informe URL do YouTube ou selecione um arquivo'
  );

export default function NewVideoModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.youtubeUrl) formData.append('youtubeUrl', data.youtubeUrl);
    if (data.file?.[0]) formData.append('file', data.file[0]);

    const token = localStorage.getItem('accessToken');
    await fetch('https://learning-platform-backend-2x39.onrender.com/videos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    setLoading(false);
    onClose();
    // opcional: recarregar lista de vídeos
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Conteúdo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Título</label>
            <Input {...register('title')} placeholder="Título do vídeo" />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Descrição</label>
            <Input {...register('description')} placeholder="Descrição (opcional)" />
          </div>

          <div>
            <label className="block text-sm mb-1">URL do YouTube</label>
            <Input {...register('youtubeUrl')} placeholder="https://youtube.com/..." />
            {errors.youtubeUrl && (
              <p className="text-red-500 text-sm">{errors.youtubeUrl.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Arquivo de Vídeo</label>
            <input type="file" {...register('file')} accept="video/*" />
            {errors.file && <p className="text-red-500 text-sm">{errors.file.message}</p>}
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
