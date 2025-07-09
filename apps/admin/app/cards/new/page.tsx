'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, NPC, CardOption } from '@repo/shared';
import { createCard, getAllNPCs } from '@repo/firebase';
import { useAuth } from '@/contexts/AuthContext';

type FormData = {
  type: Card['type'];
  category: string;
  npcId: string;
  title: string;
  description: string;
  situation: string;
  priority: 1 | 2 | 3 | 4;
  options: CardOption[];
};

export default function NewCardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      type: 'immediate',
      priority: 4,
      options: [
        { text: '', consequences: {}, resultText: '', npcEmotion: 'neutral' },
        { text: '', consequences: {}, resultText: '', npcEmotion: 'neutral' },
        { text: '', consequences: {}, resultText: '', npcEmotion: 'neutral' },
        { text: '', consequences: {}, resultText: '', npcEmotion: 'neutral' },
      ],
    },
  });

  useEffect(() => {
    loadNPCs();
  }, []);

  const loadNPCs = async () => {
    try {
      const npcsData = await getAllNPCs();
      setNpcs(npcsData);
    } catch (error) {
      console.error('Error loading NPCs:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const userInfo = user ? { userId: user.uid, userEmail: user.email || 'unknown' } : undefined;
      await createCard({
        ...data,
        priority: Number(data.priority) as 1 | 2 | 3 | 4,
        options: data.options as [CardOption, CardOption, CardOption, CardOption],
      }, userInfo);
      router.push('/cards');
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Не удалось создать карту');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cards" className="p-2 hover:bg-admin-bg rounded transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Создать новую карту</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="admin-card">
            <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Тип карты</label>
                <select {...register('type', { required: true })} className="admin-input">
                  <option value="immediate">Немедленная</option>
                  <option value="passive_income">Пассивный доход</option>
                  <option value="debt">Долг</option>
                  <option value="modifier">Модификатор</option>
                  <option value="delayed">Отложенная</option>
                  <option value="social">Социальная</option>
                  <option value="chain">Цепочка</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Приоритет</label>
                <select {...register('priority', { required: true, valueAsNumber: true })} className="admin-input">
                  <option value={1}>1 - Критический</option>
                  <option value={2}>2 - Рисковый</option>
                  <option value={3}>3 - Сюжетный</option>
                  <option value={4}>4 - Обычный</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">НПС</label>
                <select {...register('npcId', { required: true })} className="admin-input">
                  <option value="">Выберите НПС...</option>
                  {npcs.map(npc => (
                    <option key={npc.id} value={npc.id}>{npc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Категория</label>
                <input
                  {...register('category', { required: true })}
                  className="admin-input"
                  placeholder="напр., бизнес, социальная, риск"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Название</label>
              <input
                {...register('title', { required: true })}
                className="admin-input"
                placeholder="Название карты"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Описание</label>
              <input
                {...register('description', { required: true })}
                className="admin-input"
                placeholder="Краткое описание"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Ситуация</label>
              <textarea
                {...register('situation', { required: true })}
                className="admin-input"
                rows={3}
                placeholder="Текст сценария для игрока"
              />
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-xl font-semibold mb-4">Варианты выбора</h2>
            
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="mb-6 p-4 bg-admin-bg rounded-lg">
                <h3 className="font-medium mb-3">Вариант {idx + 1}</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Текст выбора</label>
                    <input
                      {...register(`options.${idx}.text` as const, { required: true })}
                      className="admin-input"
                      placeholder="Что видит игрок"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Изменение денег</label>
                      <input
                        type="number"
                        {...register(`options.${idx}.consequences.money` as const, { valueAsNumber: true })}
                        className="admin-input"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Изменение репутации</label>
                      <input
                        type="number"
                        {...register(`options.${idx}.consequences.reputation` as const, { valueAsNumber: true })}
                        className="admin-input"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Текст результата</label>
                    <textarea
                      {...register(`options.${idx}.resultText` as const, { required: true })}
                      className="admin-input"
                      rows={2}
                      placeholder="Реакция НПС после выбора"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Эмоция НПС</label>
                    <select
                      {...register(`options.${idx}.npcEmotion` as const, { required: true })}
                      className="admin-input"
                    >
                      <option value="neutral">Нейтральная</option>
                      <option value="positive">Позитивная</option>
                      <option value="negative">Негативная</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="admin-button flex-1"
            >
              {loading ? 'Создание...' : 'Создать карту'}
            </button>
            <Link href="/cards" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}