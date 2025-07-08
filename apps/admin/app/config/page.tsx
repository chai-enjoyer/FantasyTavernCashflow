'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { GameConfig } from '@repo/shared';
import { getGameConfig, updateGameConfig, initializeGameConfig } from '@repo/firebase';

export default function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { register, handleSubmit, reset } = useForm<Omit<GameConfig, 'updatedAt'>>();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      let config = await getGameConfig();
      if (!config) {
        await initializeGameConfig();
        config = await getGameConfig();
      }
      if (config) {
        reset(config);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Omit<GameConfig, 'updatedAt'>) => {
    setSaving(true);
    try {
      await updateGameConfig(data);
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Game Configuration</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="admin-card">
            <h2 className="text-xl font-semibold mb-4">Starting Values</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Starting Money</label>
                <input
                  type="number"
                  {...register('startingMoney', { required: true, valueAsNumber: true })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Starting Reputation</label>
                <input
                  type="number"
                  {...register('startingReputation', { required: true, valueAsNumber: true })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Base Income (per turn)</label>
                <input
                  type="number"
                  {...register('baseIncome', { required: true, valueAsNumber: true })}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Base Costs (per turn)</label>
                <input
                  type="number"
                  {...register('baseCosts', { required: true, valueAsNumber: true })}
                  className="admin-input"
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-xl font-semibold mb-4">Scaling Formulas</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Money Scaling Formula</label>
                <textarea
                  {...register('scalingFormulas.moneyScaling', { required: true })}
                  className="admin-input font-mono text-sm"
                  rows={3}
                />
                <p className="text-xs text-gray-400 mt-1">
                  JavaScript formula for scaling money amounts based on current balance
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reputation Impact Description</label>
                <textarea
                  {...register('scalingFormulas.reputationImpact', { required: true })}
                  className="admin-input"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Risk Calculation Description</label>
                <textarea
                  {...register('scalingFormulas.riskCalculation', { required: true })}
                  className="admin-input"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-xl font-semibold mb-4">Version</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">Game Version</label>
              <input
                {...register('version', { required: true })}
                className="admin-input"
                placeholder="1.0.0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="admin-button w-full flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </div>
  );
}