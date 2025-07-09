'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { NPC } from '@repo/shared';
import { getNPC, updateNPC } from '@repo/firebase';
import { useAuth } from '@/contexts/AuthContext';

type FormData = {
  name: string;
  class: NPC['class'];
  wealth: 1 | 2 | 3 | 4 | 5;
  reliability: number;
  description: string;
  portraits: {
    neutral: string;
    positive: string;
    negative: string;
  };
};

export default function EditNPCPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const npcId = searchParams.get('id');
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [loadingNPC, setLoadingNPC] = useState(true);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    if (!npcId) {
      router.push('/npcs');
      return;
    }
    loadNPC();
  }, [npcId]);

  const loadNPC = async () => {
    if (!npcId) return;
    
    try {
      const npcData = await getNPC(npcId);
      
      if (!npcData) {
        router.push('/npcs');
        return;
      }
      
      // Set form values
      setValue('name', npcData.name);
      setValue('class', npcData.class);
      setValue('wealth', npcData.wealth);
      setValue('reliability', npcData.reliability);
      setValue('description', npcData.description || '');
      setValue('portraits.neutral', npcData.portraits.neutral);
      setValue('portraits.positive', npcData.portraits.positive);
      setValue('portraits.negative', npcData.portraits.negative);
    } catch (error) {
      console.error('Error loading NPC:', error);
      router.push('/npcs');
    } finally {
      setLoadingNPC(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!npcId) return;
    
    setLoading(true);
    try {
      const userInfo = user ? { userId: user.uid, userEmail: user.email || 'unknown' } : undefined;
      await updateNPC(npcId, {
        ...data,
        wealth: Number(data.wealth) as 1 | 2 | 3 | 4 | 5,
        reliability: Number(data.reliability),
      }, userInfo);
      router.push('/npcs');
    } catch (error) {
      console.error('Error updating NPC:', error);
      alert('Не удалось обновить НПС');
    } finally {
      setLoading(false);
    }
  };

  if (!npcId) {
    return null;
  }

  if (loadingNPC) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/npcs" className="p-2 hover:bg-admin-bg rounded transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Редактировать НПС</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="admin-card">
            <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Имя</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="admin-input"
                  placeholder="Имя НПС"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Класс</label>
                  <select {...register('class', { required: true })} className="admin-input">
                    <option value="commoner">Обыватель</option>
                    <option value="merchant">Торговец</option>
                    <option value="noble">Дворянин</option>
                    <option value="adventurer">Авантюрист</option>
                    <option value="criminal">Преступник</option>
                    <option value="guard">Стражник</option>
                    <option value="cleric">Жрец</option>
                    <option value="mage">Маг</option>
                    <option value="royal">Королевская особа</option>
                    <option value="crime_boss">Главарь</option>
                    <option value="dragon">Дракон</option>
                    <option value="bard">Бард</option>
                    <option value="alchemist">Алхимик</option>
                    <option value="dwarf">Гном</option>
                    <option value="elf">Эльф</option>
                    <option value="halfling">Полурослик</option>
                    <option value="orc">Орк</option>
                    <option value="vampire">Вампир</option>
                    <option value="pirate">Пират</option>
                    <option value="monk">Монах</option>
                    <option value="witch">Ведьма</option>
                    <option value="knight">Рыцарь</option>
                    <option value="necromancer">Некромант</option>
                    <option value="barbarian">Варвар</option>
                    <option value="artisan">Ремесленник</option>
                    <option value="scholar">Учёный</option>
                    <option value="blacksmith">Кузнец</option>
                    <option value="hunter">Охотник</option>
                    <option value="sailor">Моряк</option>
                    <option value="healer">Лекарь</option>
                    <option value="beggar">Нищий</option>
                    <option value="artist">Художник</option>
                    <option value="official">Чиновник</option>
                    <option value="mystic">Мистик</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Уровень богатства</label>
                  <select {...register('wealth', { required: true, valueAsNumber: true })} className="admin-input">
                    <option value={1}>1 - Бедный</option>
                    <option value={2}>2 - Скромный</option>
                    <option value={3}>3 - Зажиточный</option>
                    <option value={4}>4 - Богатый</option>
                    <option value={5}>5 - Очень богатый</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Надёжность (%)</label>
                <input
                  type="number"
                  {...register('reliability', { 
                    required: true,
                    min: { value: 0, message: 'Должно быть не меньше 0' },
                    max: { value: 100, message: 'Должно быть не больше 100' },
                    valueAsNumber: true
                  })}
                  className="admin-input"
                  placeholder="0-100"
                />
                {errors.reliability && (
                  <p className="text-red-500 text-sm mt-1">{errors.reliability.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  {...register('description')}
                  className="admin-input"
                  rows={3}
                  placeholder="Описание персонажа"
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-xl font-semibold mb-4">Ссылки на портреты</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Нейтральный портрет</label>
                <input
                  {...register('portraits.neutral', { required: true })}
                  className="admin-input"
                  placeholder="/images/npcs/character_neutral.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Позитивный портрет</label>
                <input
                  {...register('portraits.positive', { required: true })}
                  className="admin-input"
                  placeholder="/images/npcs/character_positive.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Негативный портрет</label>
                <input
                  {...register('portraits.negative', { required: true })}
                  className="admin-input"
                  placeholder="/images/npcs/character_negative.png"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="admin-button flex-1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            <Link href="/npcs" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}