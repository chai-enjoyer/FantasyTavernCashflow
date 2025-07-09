'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Star, Users, TrendingUp, AlertTriangle, Target, Info } from 'lucide-react';
import { EMOJI } from '@repo/shared';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-4 bg-game-card border border-game-border rounded-xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-game-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-game-text">Как играть</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-game-bg rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Objective */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-500" />
                  Цель игры
                </h3>
                <p className="text-gray-300 text-sm">
                  Управляйте фэнтезийной таверной, принимая стратегические решения. Балансируйте прибыль с репутацией
                  для создания успешного бизнеса в фэнтезийном мире.
                </p>
              </div>

              {/* Key Resources */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Основные ресурсы
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{EMOJI.MONEY}</span>
                    <div>
                      <p className="font-semibold text-game-text">Золото</p>
                      <p className="text-sm text-gray-400">
                        Ваша валюта. Зарабатывайте через умные решения, но не дайте ему закончиться!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{EMOJI.REPUTATION}</span>
                    <div>
                      <p className="font-semibold text-game-text">Репутация</p>
                      <p className="text-sm text-gray-400">
                        Как вас видит сообщество. Высокая репутация привлекает лучших клиентов.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{EMOJI.RISK}</span>
                    <div>
                      <p className="font-semibold text-game-text">Риск</p>
                      <p className="text-sm text-gray-400">
                        Низкая репутация увеличивает риск. Высокий риск означает опасные ситуации!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Character Types */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Типы персонажей
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Простолюдины</span>
                    <span className="text-game-text">Мало денег, высокая надёжность</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Искатели приключений</span>
                    <span className="text-game-text">Средний достаток, переменчивая надёжность</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Дворяне</span>
                    <span className="text-game-text">Богаты, требовательны</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Преступники</span>
                    <span className="text-game-text">Хорошие деньги, рискованные сделки</span>
                  </div>
                </div>
              </div>

              {/* Decision Making */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Советы по принятию решений
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Каждый выбор имеет последствия - думайте о долгосрочных эффектах</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Построение отношений с НПС может привести к лучшим возможностям</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Балансируйте сиюминутную прибыль с репутацией для устойчивого роста</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Некоторые выборы открывают особые события или пассивный доход</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Остерегайтесь долгов - они могут быстро выйти из-под контроля</span>
                  </li>
                </ul>
              </div>

              {/* Special Mechanics */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Особые механики
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-game-text">Пассивный доход</p>
                    <p className="text-gray-400">
                      Некоторые выборы дают постоянный доход на несколько ходов
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-game-text">Временные эффекты</p>
                    <p className="text-gray-400">
                      Благословения, проклятия и другие эффекты, изменяющие ваши ресурсы
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-game-text">Цепные события</p>
                    <p className="text-gray-400">
                      Ваши выборы могут вызвать последующие события в следующих ходах
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-game-text">Отношения с НПС</p>
                    <p className="text-gray-400">
                      Создание дружбы или вражды влияет на будущие встречи
                    </p>
                  </div>
                </div>
              </div>

              {/* Game Over Conditions */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <X className="w-5 h-5 text-red-500" />
                  Условия поражения
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Закончилось золото (банкротство)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Репутация упала слишком низко (таверна закрывается)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Слишком много врагов (вынужденный уход)</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}