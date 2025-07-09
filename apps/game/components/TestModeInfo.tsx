'use client';

import { motion } from 'framer-motion';
import { Beaker, AlertCircle, Play } from 'lucide-react';

interface TestModeInfoProps {
  onStartTest: () => void;
}

export default function TestModeInfo({ onStartTest }: TestModeInfoProps) {
  return (
    <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-game-card border border-game-border rounded-xl p-6 space-y-6"
      >
        <div className="text-center">
          <Beaker className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-game-text mb-2">Тестовый режим в браузере</h1>
          <p className="text-gray-400">Тестируйте игру без Telegram</p>
        </div>

        <div className="space-y-4">
          <div className="bg-game-bg rounded-lg p-4 border border-game-border">
            <h2 className="text-lg font-semibold text-game-text mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              Функции тестового режима
            </h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Не требуется приложение Telegram</li>
              <li>• Панель отладки с логами консоли</li>
              <li>• Тестовые данные пользователя</li>
              <li>• Экспорт логов для отладки</li>
              <li>• Полная функциональность игры</li>
            </ul>
          </div>

          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-300">
              <strong>Примечание:</strong> Прогресс в тестовом режиме временный. Для полного опыта с сохранением прогресса, пожалуйста, используйте приложение Telegram.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onStartTest}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Начать тестовый режим
          </button>
          
          <a
            href="https://t.me/FantasyTavernCashflowBot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-game-bg hover:bg-gray-800 text-game-text font-semibold rounded-lg transition-colors border border-game-border block text-center"
          >
            Открыть в Telegram
          </a>
        </div>
      </motion.div>
    </div>
  );
}