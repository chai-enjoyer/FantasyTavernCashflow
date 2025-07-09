'use client';

import { useState } from 'react';
import { Volume2, VolumeX, Music, Vibrate, X } from 'lucide-react';
import { AudioService } from '@/services/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const audio = AudioService.getInstance();
  
  const [soundEnabled, setSoundEnabled] = useState(audio.getSoundEnabled());
  const [musicEnabled, setMusicEnabled] = useState(audio.getMusicEnabled());
  const [hapticEnabled, setHapticEnabled] = useState(audio.getHapticEnabled());

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    audio.setSoundEnabled(newValue);
    if (newValue) {
      audio.playSound('buttonClick');
    }
  };

  const handleMusicToggle = () => {
    const newValue = !musicEnabled;
    setMusicEnabled(newValue);
    audio.setMusicEnabled(newValue);
  };

  const handleHapticToggle = () => {
    const newValue = !hapticEnabled;
    setHapticEnabled(newValue);
    audio.setHapticEnabled(newValue);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Настройки</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Закрыть настройки"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-green-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <p className="text-white font-medium">Звуковые эффекты</p>
                <p className="text-gray-400 text-sm">Игровые звуковые эффекты</p>
              </div>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                soundEnabled ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Music className={`w-5 h-5 ${musicEnabled ? 'text-green-400' : 'text-gray-500'}`} />
              <div>
                <p className="text-white font-medium">Фоновая музыка</p>
                <p className="text-gray-400 text-sm">Атмосферная музыка таверны</p>
              </div>
            </div>
            <button
              onClick={handleMusicToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                musicEnabled ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  musicEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <Vibrate className={`w-5 h-5 ${hapticEnabled ? 'text-green-400' : 'text-gray-500'}`} />
              <div>
                <p className="text-white font-medium">Тактильная отдача</p>
                <p className="text-gray-400 text-sm">Вибрационная отдача</p>
              </div>
            </div>
            <button
              onClick={handleHapticToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                hapticEnabled ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  hapticEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm text-center">
            Настройки сохраняются автоматически
          </p>
        </div>
      </div>
    </div>
  );
}