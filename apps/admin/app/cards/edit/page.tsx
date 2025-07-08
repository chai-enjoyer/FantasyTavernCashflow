'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Card, NPC, CardOption } from '@repo/shared';
import { getCard, updateCard, getAllNPCs } from '@repo/firebase';

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

export default function EditCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardId = searchParams.get('id');
  
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCard, setLoadingCard] = useState(true);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    if (!cardId) {
      router.push('/cards');
      return;
    }
    loadData();
  }, [cardId]);

  const loadData = async () => {
    if (!cardId) return;
    
    try {
      const [cardData, npcsData] = await Promise.all([
        getCard(cardId),
        getAllNPCs(),
      ]);
      
      if (!cardData) {
        router.push('/cards');
        return;
      }

      setNpcs(npcsData);
      
      // Set form values
      setValue('type', cardData.type);
      setValue('category', cardData.category);
      setValue('npcId', cardData.npcId);
      setValue('title', cardData.title);
      setValue('description', cardData.description);
      setValue('situation', cardData.situation);
      setValue('priority', cardData.priority);
      setValue('options', cardData.options);
    } catch (error) {
      console.error('Error loading data:', error);
      router.push('/cards');
    } finally {
      setLoadingCard(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!cardId) return;
    
    setLoading(true);
    try {
      await updateCard(cardId, {
        ...data,
        priority: Number(data.priority) as 1 | 2 | 3 | 4,
        options: data.options as [CardOption, CardOption, CardOption, CardOption],
      });
      router.push('/cards');
    } catch (error) {
      console.error('Error updating card:', error);
      alert('Failed to update card');
    } finally {
      setLoading(false);
    }
  };

  if (!cardId) {
    return null;
  }

  if (loadingCard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cards" className="p-2 hover:bg-admin-bg rounded transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Edit Card</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="admin-card">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Card Type</label>
                <select {...register('type', { required: true })} className="admin-input">
                  <option value="immediate">Immediate</option>
                  <option value="passive_income">Passive Income</option>
                  <option value="debt">Debt</option>
                  <option value="modifier">Modifier</option>
                  <option value="delayed">Delayed</option>
                  <option value="social">Social</option>
                  <option value="chain">Chain</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select {...register('priority', { required: true, valueAsNumber: true })} className="admin-input">
                  <option value={1}>1 - Critical</option>
                  <option value={2}>2 - Risk</option>
                  <option value={3}>3 - Story</option>
                  <option value={4}>4 - Normal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">NPC</label>
                <select {...register('npcId', { required: true })} className="admin-input">
                  <option value="">Select NPC...</option>
                  {npcs.map(npc => (
                    <option key={npc.id} value={npc.id}>{npc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  {...register('category', { required: true })}
                  className="admin-input"
                  placeholder="e.g., business, social, risk"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                {...register('title', { required: true })}
                className="admin-input"
                placeholder="Card title"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <input
                {...register('description', { required: true })}
                className="admin-input"
                placeholder="Brief description"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Situation</label>
              <textarea
                {...register('situation', { required: true })}
                className="admin-input"
                rows={3}
                placeholder="The scenario text shown to player"
              />
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-xl font-semibold mb-4">Options</h2>
            
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="mb-6 p-4 bg-admin-bg rounded-lg">
                <h3 className="font-medium mb-3">Option {idx + 1}</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Choice Text</label>
                    <input
                      {...register(`options.${idx}.text` as const, { required: true })}
                      className="admin-input"
                      placeholder="What the player sees"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Money Change</label>
                      <input
                        type="number"
                        {...register(`options.${idx}.consequences.money` as const, { valueAsNumber: true })}
                        className="admin-input"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Reputation Change</label>
                      <input
                        type="number"
                        {...register(`options.${idx}.consequences.reputation` as const, { valueAsNumber: true })}
                        className="admin-input"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Result Text</label>
                    <textarea
                      {...register(`options.${idx}.resultText` as const, { required: true })}
                      className="admin-input"
                      rows={2}
                      placeholder="NPC reaction after choice"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">NPC Emotion</label>
                    <select
                      {...register(`options.${idx}.npcEmotion` as const, { required: true })}
                      className="admin-input"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
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
              className="admin-button flex-1 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/cards" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}