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
    title: 'Welcome to Fantasy Tavern!',
    description: 'You are the owner of a magical tavern in a fantasy world. Your goal is to keep your business running by making strategic decisions.',
    icon: <Sparkles className="w-8 h-8" />,
    tip: 'Each decision affects your money and reputation!',
  },
  {
    title: 'Money Management',
    description: 'Your money is your lifeblood. Running out means bankruptcy! Each visitor will present choices that can increase or decrease your funds.',
    icon: <Coins className="w-8 h-8" />,
    tip: 'Higher risk choices often yield better rewards.',
  },
  {
    title: 'Reputation Matters',
    description: 'Your reputation affects pricing and customer quality. Good reputation brings wealthy patrons, while bad reputation attracts trouble.',
    icon: <Shield className="w-8 h-8" />,
    tip: 'Reputation affects how much you can charge!',
  },
  {
    title: 'Know Your Visitors',
    description: 'Different NPCs have different personalities. Nobles might pay well but are demanding, while adventurers bring risk but also opportunity.',
    icon: <Users className="w-8 h-8" />,
    tip: 'Pay attention to visitor classes and moods.',
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
            aria-label="Skip tutorial"
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
                <span className="font-semibold">Tip:</span> {step.tip}
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
              <span>{currentStep === tutorialSteps.length - 1 ? 'Start Playing' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}