'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { NPC } from '@repo/shared';
import { getNPC, updateNPC } from '@repo/firebase';

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
      await updateNPC(npcId, {
        ...data,
        wealth: Number(data.wealth) as 1 | 2 | 3 | 4 | 5,
        reliability: Number(data.reliability),
      });
      router.push('/npcs');
    } catch (error) {
      console.error('Error updating NPC:', error);
      alert('Failed to update NPC');
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
        <div className="text-center">Loading...</div>
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
          <h1 className="text-3xl font-bold">Edit NPC</h1>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Class</label>
                  <select {...register('class', { required: true })} className="admin-input">
                    <option value="commoner">Commoner</option>
                    <option value="adventurer">Adventurer</option>
                    <option value="criminal">Criminal</option>
                    <option value="noble">Noble</option>
                    <option value="royal">Royal</option>
                    <option value="cleric">Cleric</option>
                    <option value="mage">Mage</option>
                    <option value="crime_boss">Crime Boss</option>
                    <option value="dragon">Dragon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Wealth Level</label>
                  <select {...register('wealth', { required: true, valueAsNumber: true })} className="admin-input">
                    <option value={1}>1 - Poor</option>
                    <option value={2}>2 - Modest</option>
                    <option value={3}>3 - Comfortable</option>
                    <option value={4}>4 - Wealthy</option>
                    <option value={5}>5 - Rich</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reliability (%)</label>
                <input
                  type="number"
                  {...register('reliability', { 
                    required: true,
                    min: { value: 0, message: 'Must be at least 0' },
                    max: { value: 100, message: 'Must be at most 100' },
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
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  {...register('description')}
                  className="admin-input"
                  rows={3}
                  placeholder="Character description"
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
                  {...register('portraits.neutral', { required: true })}
                  className="admin-input"
                  placeholder="/images/npcs/character_neutral.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Positive Portrait</label>
                <input
                  {...register('portraits.positive', { required: true })}
                  className="admin-input"
                  placeholder="/images/npcs/character_positive.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Negative Portrait</label>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/npcs" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}