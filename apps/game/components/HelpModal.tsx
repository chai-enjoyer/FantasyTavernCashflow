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
              <h2 className="text-xl font-bold text-game-text">How to Play</h2>
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
                  Objective
                </h3>
                <p className="text-gray-300 text-sm">
                  Manage your fantasy tavern by making strategic decisions. Balance profit with reputation
                  to build a successful business while navigating the challenges of a fantasy world.
                </p>
              </div>

              {/* Key Resources */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Key Resources
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{EMOJI.MONEY}</span>
                    <div>
                      <p className="font-semibold text-game-text">Gold</p>
                      <p className="text-sm text-gray-400">
                        Your currency. Earn it through smart decisions, but don't run out!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{EMOJI.REPUTATION}</span>
                    <div>
                      <p className="font-semibold text-game-text">Reputation</p>
                      <p className="text-sm text-gray-400">
                        How the community sees you. High reputation attracts better customers.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{EMOJI.RISK}</span>
                    <div>
                      <p className="font-semibold text-game-text">Risk</p>
                      <p className="text-sm text-gray-400">
                        Lower reputation increases risk. High risk means dangerous situations!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Character Types */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Character Types
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Commoners</span>
                    <span className="text-game-text">Low wealth, high reliability</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Adventurers</span>
                    <span className="text-game-text">Medium wealth, variable reliability</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nobles</span>
                    <span className="text-game-text">High wealth, demanding</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Criminals</span>
                    <span className="text-game-text">Good money, risky deals</span>
                  </div>
                </div>
              </div>

              {/* Decision Making */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Decision Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Each choice has consequences - think about long-term effects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Building relationships with NPCs can lead to better opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Balance immediate profit with reputation for sustainable growth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Some choices unlock special events or passive income</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>Watch out for debt - it can quickly spiral out of control</span>
                  </li>
                </ul>
              </div>

              {/* Special Mechanics */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Special Mechanics
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-game-text">Passive Income</p>
                    <p className="text-gray-400">
                      Some choices grant recurring income for multiple turns
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-game-text">Temporary Effects</p>
                    <p className="text-gray-400">
                      Blessings, curses, and other effects that modify your resources
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-game-text">Chain Events</p>
                    <p className="text-gray-400">
                      Your choices can trigger follow-up events in later turns
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-game-text">NPC Relationships</p>
                    <p className="text-gray-400">
                      Building friendships or making enemies affects future encounters
                    </p>
                  </div>
                </div>
              </div>

              {/* Game Over Conditions */}
              <div className="bg-game-bg rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <X className="w-5 h-5 text-red-500" />
                  Game Over Conditions
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Running out of gold (bankruptcy)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Reputation drops too low (tavern closes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>Making too many enemies (forced out)</span>
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