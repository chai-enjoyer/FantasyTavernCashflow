'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NPC } from '@repo/shared';
import { createNPC } from '@repo/firebase';

type FormData = Omit<NPC, 'id' | 'createdAt' | 'updatedAt'>;

export default function NewNPCPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      wealth: 3,
      reliability: 80,
      portraits: {
        neutral: '',
        positive: '',
        negative: '',
      },
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await createNPC(data);
      router.push('/npcs');
    } catch (error) {
      console.error('Error creating NPC:', error);
      alert('Failed to create NPC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/npcs" className="p-2 hover:bg-admin-bg rounded transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Create New NPC</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="admin-card">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="admin-input"
                  placeholder="NPC name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Class</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Wealth (1-5)</label>
                  <input
                    type="number"
                    {...register('wealth', { 
                      required: true, 
                      valueAsNumber: true,
                      min: 1,
                      max: 5
                    })}
                    className="admin-input"
                    min="1"
                    max="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Reliability (%)</label>
                  <input
                    type="number"
                    {...register('reliability', { 
                      required: true, 
                      valueAsNumber: true,
                      min: 0,
                      max: 100
                    })}
                    className="admin-input"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  {...register('description')}
                  className="admin-input"
                  rows={3}
                  placeholder="Brief description of the NPC"
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-xl font-semibold mb-4">Portrait URLs</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Neutral Portrait</label>
                <input
                  {...register('portraits.neutral')}
                  className="admin-input"
                  placeholder="https://example.com/neutral.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Positive Portrait</label>
                <input
                  {...register('portraits.positive')}
                  className="admin-input"
                  placeholder="https://example.com/positive.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Negative Portrait</label>
                <input
                  {...register('portraits.negative')}
                  className="admin-input"
                  placeholder="https://example.com/negative.jpg"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="admin-button flex-1"
            >
              {loading ? 'Creating...' : 'Create NPC'}
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