'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Coins, Shield, Users, Sparkles } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Добро пожаловать в Фэнтезийную Таверну!',
    description: 'Вы - владелец волшебной таверны в фэнтезийном мире. Ваша цель - поддерживать работу бизнеса, принимая стратегические решения.',
    icon: <Sparkles className="w-8 h-8" />,
    tip: 'Каждое решение влияет на ваши деньги и репутацию!',
  },
  {
    title: 'Управление деньгами',
    description: 'Деньги - это ваша жизненная сила. Если они закончатся - вы банкрот! Каждый посетитель предложит выбор, который может увеличить или уменьшить ваши средства.',
    icon: <Coins className="w-8 h-8" />,
    tip: 'Более рискованный выбор часто приносит лучшую награду.',
  },
  {
    title: 'Репутация важна',
    description: 'Ваша репутация влияет на цены и качество клиентов. Хорошая репутация привлекает богатых посетителей, плохая - приносит неприятности.',
    icon: <Shield className="w-8 h-8" />,
    tip: 'Репутация влияет на то, сколько вы можете брать за услуги!',
  },
  {
    title: 'Изучайте посетителей',
    description: 'У разных НПС разные характеры. Дворяне могут хорошо платить, но требовательны, а искатели приключений приносят риск, но и возможности.',
    icon: <Users className="w-8 h-8" />,
    tip: 'Обращайте внимание на класс и настроение посетителей.',
  },
];

interface TutorialProps {
  onComplete: () => void;
}

export default function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { analytics } = useAnalytics();

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      analytics.trackTutorial(`step_${currentStep + 1}_completed`);
      setCurrentStep(currentStep + 1);
    } else {
      analytics.trackTutorial('completed');
      onComplete();
    }
  };

  const handleSkip = () => {
    analytics.trackTutorial(`skipped_at_step_${currentStep + 1}`);
    onComplete();
  };

  const step = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900 rounded-lg max-w-md w-full p-6 relative"
        >
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Пропустить обучение"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center mb-6 text-yellow-400">
            {step.icon}
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-4">
            {step.title}
          </h2>

          <p className="text-gray-300 text-center mb-6">
            {step.description}
          </p>

          {step.tip && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-300 text-center">
                <span className="font-semibold">Совет:</span> {step.tip}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-yellow-400'
                      : index < currentStep
                      ? 'bg-yellow-600'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>{currentStep === tutorialSteps.length - 1 ? 'Начать игру' : 'Далее'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}